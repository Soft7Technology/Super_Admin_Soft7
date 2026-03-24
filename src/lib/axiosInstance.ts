

import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// When sending FormData, remove Content-Type so axios sets multipart/form-data with boundary
axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response, // If the request is successful, just return it
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest.url.includes("/api/auth/login") ||
      originalRequest.url.includes("/api/auth/registration") ||
      originalRequest.url?.includes("/api/auth/get-role");

    // 1. Check if the error is 401 and we haven't already retried this request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
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