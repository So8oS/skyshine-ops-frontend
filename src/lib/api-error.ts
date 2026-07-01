/** Shape of the error axios throws for a non-2xx JSON response from this API. */
export interface ApiError extends Error {
  response?: {
    status?: number;
    data?: {
      error?: string;
      details?: { path: string; message: string }[];
    };
  };
}

/** Prefer Zod validation `details` (joined) over the top-level `error` string, falling back if neither is present. */
export function getApiErrorMessage(error: ApiError, fallback = "Something went wrong"): string {
  const data = error.response?.data;
  if (!data) return fallback;
  if (data.details?.length) {
    return data.details.map((d) => d.message).join(". ");
  }
  return data.error ?? fallback;
}
