import axios from "axios";

const NGROK_BASE_URL = process.env.NEXT_PUBLIC_NGROK_BASE_URL || "https://oralee-spiritlike-writhingly.ngrok-free.dev/v1/admin";

export const axiosInstance = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Axios instance for the external ngrok API
export const ngrokAxiosInstance = axios.create({
  baseURL: NGROK_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Attach console_access_token from localStorage for ngrok instance
ngrokAxiosInstance.interceptors.request.use((config) => {
  let token = typeof window !== "undefined"
    ? localStorage.getItem("console_access_token")
    : null;

  // Strip surrounding quotes if present
  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// Attach console_access_token from localStorage as Bearer token + handle FormData
axiosInstance.interceptors.request.use((config) => {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("console_access_token")
    : null;

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response, // If the request is successful, just return it
  async (error) => {
    const originalRequest = error.config || {};
    const requestUrl = String(originalRequest.url || "");

    const isAuthRoute =
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("/api/auth/registration") ||
      requestUrl.includes("/api/auth/get-role") ||
      requestUrl.includes("/api/auth/refresh");

    const hasExternalToken =
      typeof window !== "undefined" &&
      !!window.localStorage.getItem("console_access_token");

    // 1. Check if the error is 401 and we haven't already retried this request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute &&
      !hasExternalToken
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
        // 4. If refresh fails (e.g., refresh token expired/revoked)
        // Keep caller-level handling in external-token mode and avoid forced redirect loops
        if (!hasExternalToken) {
          window.location.href = "/auth";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);