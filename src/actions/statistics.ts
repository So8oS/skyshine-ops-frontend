import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

/* ---------- Types ---------- */

export type SchdualeStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type DroneStatusOverview =
  | "AVAILABLE"
  | "MAINTENANCE"
  | "OUT_OF_SERVICE";

export type JobTypeOverview = "INSPECTION" | "CLEANING";

export interface StatisticsOverview {
  totalUsers: number;
  totalSites: number;
  totalJobs: number;
  schedulesByStatus: Record<SchdualeStatus, number>;
  totalSchedules: number;
  dronesByStatus: Record<DroneStatusOverview, number>;
  totalDrones: number;
  dateRange?: { from: string; to: string };
}

export interface JobStats {
  total: number;
  byType: Record<JobTypeOverview, number>;
}

export interface DroneStats {
  total: number;
  byStatus: Record<DroneStatusOverview, number>;
}

export interface StatisticsOverviewResponse {
  data: StatisticsOverview;
}

export interface JobStatsResponse {
  data: JobStats;
}

export interface DroneStatsResponse {
  data: DroneStats;
}

export interface StatisticsOverviewParams {
  from?: string;
  to?: string;
}

/* ---------- API ---------- */

export const statisticsApi = {
  getOverview: async (
    params: StatisticsOverviewParams = {}
  ): Promise<StatisticsOverview> => {
    const searchParams = new URLSearchParams();
    if (params.from) searchParams.set("from", params.from);
    if (params.to) searchParams.set("to", params.to);
    const qs = searchParams.toString();
    const url = qs ? `/api/statistics/overview?${qs}` : "/api/statistics/overview";
    const response = await api.get<StatisticsOverviewResponse>(url);
    return response.data.data;
  },

  getJobStats: async (): Promise<JobStats> => {
    const response = await api.get<JobStatsResponse>("/api/statistics/jobs");
    return response.data.data;
  },

  getDroneStats: async (): Promise<DroneStats> => {
    const response = await api.get<DroneStatsResponse>("/api/statistics/drones");
    return response.data.data;
  },
};

/* ---------- Query Keys ---------- */

export const statisticsKeys = {
  all: ["statistics"] as const,
  overview: (params?: StatisticsOverviewParams) =>
    [...statisticsKeys.all, "overview", params ?? {}] as const,
  jobStats: () => [...statisticsKeys.all, "jobs"] as const,
  droneStats: () => [...statisticsKeys.all, "drones"] as const,
};

/* ---------- Hooks ---------- */

export const useStatisticsOverview = (
  params: StatisticsOverviewParams = {},
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: statisticsKeys.overview(params),
    queryFn: () => statisticsApi.getOverview(params),
    staleTime: 1000 * 60 * 2,
    ...options,
  });
};

export const useJobStats = () => {
  return useQuery({
    queryKey: statisticsKeys.jobStats(),
    queryFn: () => statisticsApi.getJobStats(),
    staleTime: 1000 * 60 * 2,
  });
};

export const useDroneStats = () => {
  return useQuery({
    queryKey: statisticsKeys.droneStats(),
    queryFn: () => statisticsApi.getDroneStats(),
    staleTime: 1000 * 60 * 2,
  });
};
