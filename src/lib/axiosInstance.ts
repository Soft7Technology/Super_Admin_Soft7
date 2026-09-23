

import axios from "axios";
import { getAuthToken, setAuthToken, redirectToLogin } from "./auth-client";

export const axiosInstance = axios.create({
  baseURL: "https://hostapi.soft7.in",
  // baseURL: "http://localhost:5000",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Automatically inject Authorization header if token exists
axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Handle 401 Unauthorized globally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url ?? "";

    const isAuthRoute =
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("/api/auth/registration") ||
      requestUrl.includes("/api/auth/get-role") ||
      requestUrl.includes("/v1/auth/");

    // If 401 and not already retried, and not an auth attempt
    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the access token via local refresh endpoint
        const refreshRes = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
        const newToken =
          refreshRes.data?.token ??
          refreshRes.data?.accessToken ??
          refreshRes.data?.access_token;

        if (newToken) {
          setAuthToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch {
        // Token refresh failed or session completely expired
        redirectToLogin("session_expired");
        return Promise.reject(error);
      }

      // If no token was obtained from refresh, redirect
      redirectToLogin("session_expired");
    }

    return Promise.reject(error);
  },
);

