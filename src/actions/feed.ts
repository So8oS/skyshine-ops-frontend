import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

/* ---------- Types ---------- */

export type FeedItemKind =
  | "SCHEDULE_UPDATED"
  | "SITE_CREATED"
  | "JOB_CREATED"
  | "DRONE_CREATED";

export interface FeedItem {
  id: string;
  kind: FeedItemKind;
  at: string;
  actor: { id: string; name: string } | null;
  summary: string;
  refId: string;
}

export interface FeedResponse {
  data: {
    items: FeedItem[];
  };
}

/* ---------- API ---------- */

export const feedApi = {
  getAll: async (limit = 20): Promise<FeedItem[]> => {
    const response = await api.get<FeedResponse>(`/api/feed?limit=${limit}`);
    return response.data.data.items;
  },
};

/* ---------- Query Keys ---------- */

export const feedKeys = {
  all: ["feed"] as const,
  list: (limit: number) => [...feedKeys.all, limit] as const,
};

/* ---------- Query Hooks ---------- */

export const useFeed = (limit = 20) => {
  return useQuery({
    queryKey: feedKeys.list(limit),
    queryFn: () => feedApi.getAll(limit),
    refetchInterval: 30_000,
  });
};
