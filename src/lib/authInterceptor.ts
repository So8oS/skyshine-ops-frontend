import { api } from "./api";

let refreshPromise: Promise<void> | null = null;

// Auth endpoints that should NOT trigger token refresh on 401
const AUTH_ENDPOINTS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/me",
];

const isAuthEndpoint = (url?: string) =>
  AUTH_ENDPOINTS.some((endpoint) => url?.includes(endpoint));

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry auth endpoints - let them fail naturally
    if (isAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // Don't retry if already retried
    if (originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api.post("/api/auth/refresh").then(() => undefined);
      }

      await refreshPromise;
      return api(originalRequest);
    } catch (refreshErr) {
      window.location.href = "/auth";
      return Promise.reject(refreshErr);
    } finally {
      refreshPromise = null;
    }
  }
);
