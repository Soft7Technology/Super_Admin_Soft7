

import axios from "axios";

export const axiosInstance = axios.create({
  // baseURL: "https://hostapi.soft7.in",
  baseURL: "http://localhost:5000",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// When sending FormData, remove Content-Type so axios sets multipart/form-data with boundary
axiosInstance.interceptors.request.use((config) => {
  let token =
    typeof window !== "undefined"
      ? localStorage.getItem("console_access_token")
      : null;

  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response, // If the request is successful, just return it
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url ?? "";

    const isAuthRoute =
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("/api/auth/registration") ||
      requestUrl.includes("/api/auth/get-role") ||
      requestUrl.includes("/v1/auth/");

    const isExternalApi =
      /^https?:\/\//i.test(requestUrl) || requestUrl.startsWith("/v1/");

    // 1. Check if the error is 401 and we haven't already retried this request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute &&
      !isExternalApi
    ) {
      originalRequest._retry = true;

      try {
        // 2. Call your refresh token API
        // Note: We use the base axios to avoid an infinite interceptor loop
        await axios.post("/api/auth/refresh", {}, { withCredentials: true });

        // 3. If refresh is successful, retry the original request
        // The browser will automatically attach the new accessToken cookie
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 4. If refresh fails (e.g., refresh token also expired/revoked)
        // Redirect to login or clear global state
        window.location.href = "/auth";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
