import { api } from "./api";

let refreshPromise: Promise<void> | null = null;

const NO_REFRESH_ENDPOINTS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
];

const isNoRefreshEndpoint = (url?: string) =>
  NO_REFRESH_ENDPOINTS.some((endpoint) => url?.includes(endpoint));

const isUnauthorized = (status?: number) => status === 401 || status === 400;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!isUnauthorized(error.response?.status)) {
      return Promise.reject(error);
    }

    if (isNoRefreshEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

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
