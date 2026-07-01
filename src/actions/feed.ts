import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

/* ---------- Types ---------- */

export type FeedItemKind =
  | "SCHEDULE_UPDATED"
  | "SCHEDULE_CREATED"
  | "SITE_CREATED"
  | "JOB_CREATED"
  | "DRONE_CREATED"
  | "DRONE_STATUS_CHANGED";

export const FEED_KIND_LABELS: Record<FeedItemKind, string> = {
  SCHEDULE_UPDATED: "Schedule updated",
  SCHEDULE_CREATED: "Schedule created",
  SITE_CREATED: "Site created",
  JOB_CREATED: "Job created",
  DRONE_CREATED: "Drone created",
  DRONE_STATUS_CHANGED: "Drone status chgd",
};

export interface FeedItem {
  id: string;
  kind: FeedItemKind;
  at: string;
  actor: { id: string; name: string } | null;
  summary: string;
  refId: string;
}

// List params
export interface FeedListParams {
  page?: number;
  pageSize?: number;
  kind?: FeedItemKind;
  from?: string;
  to?: string;
  q?: string;
}

export interface FeedListResult {
  items: FeedItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FeedResponse {
  data: FeedListResult;
}

/* ---------- API ---------- */

export const feedApi = {
  getAll: async (params: FeedListParams = {}): Promise<FeedListResult> => {
    const { page = 1, pageSize = 20, kind, from, to, q } = params;
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("pageSize", String(pageSize));
    if (kind) searchParams.set("kind", kind);
    if (from) searchParams.set("from", from);
    if (to) searchParams.set("to", to);
    if (q) searchParams.set("q", q);

    const response = await api.get<FeedResponse>(`/api/feed?${searchParams}`);
    return response.data.data;
  },
};

/* ---------- Query Keys ---------- */

export const feedKeys = {
  all: ["feed"] as const,
  list: (params: FeedListParams) => [...feedKeys.all, "list", params] as const,
};

/* ---------- Query Hooks ---------- */

export const useFeed = (params: FeedListParams = {}) => {
  return useQuery({
    queryKey: feedKeys.list(params),
    queryFn: () => feedApi.getAll(params),
    refetchInterval: 60_000,
  });
};
