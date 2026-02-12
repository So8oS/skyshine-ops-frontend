import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { z } from "zod";
import { toast } from "sonner";
import { jobKeys } from "./jobs";

/* ---------- Types & Schemas ---------- */

/** Backend uses "schduale" in URLs and response keys. */
export type ScheduleStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/** Conflict payload returned with 409 overlap errors */
export interface ScheduleConflict {
  id: string;
  startAt: string;
  endAt: string;
  jobId: string;
}

/** Schedule (schduale) as returned by API */
export interface Schedule {
  id: string;
  jobId: string;
  pilotId: string;
  droneId: string;
  status: ScheduleStatus;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
  job?: {
    id: string;
    name: string;
    siteId?: string;
    type?: string;
    site?: { id: string; name: string };
  };
  pilot?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  drone?: {
    id: string;
    name: string;
    serialNumber: string;
    status?: string;
  };
}

// API Response types
export interface SchedulesResponse {
  data: {
    items: Schedule[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ScheduleResponse {
  data: {
    schduale: Schedule;
  };
}

export interface SchedulesByJobResponse {
  data: {
    items: Schedule[];
  };
}

export interface AvailabilityResponse {
  data: {
    startAt: string;
    endAt: string;
    availablePilots: { id: string; name: string; email?: string; phone?: string }[];
    availableDrones: { id: string; name: string; serialNumber: string; status: string }[];
    busy: { pilots: string[]; drones: string[] };
  };
}

// Request types (Zod) – dates as ISO strings, backend coerce.date() will parse
const scheduleStatusEnum = z.enum([
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const CreateScheduleInput = z.object({
  jobId: z.string().uuid("Invalid job"),
  pilotId: z.string().uuid("Invalid pilot"),
  droneId: z.string().uuid("Invalid drone"),
  startAt: z.string().min(1, "Start time is required"),
  endAt: z.string().min(1, "End time is required"),
  status: scheduleStatusEnum.optional(),
}).refine(
  (data) => new Date(data.endAt) > new Date(data.startAt),
  { message: "endAt must be after startAt", path: ["endAt"] }
);

export const UpdateScheduleInput = z.object({
  pilotId: z.string().uuid().optional(),
  droneId: z.string().uuid().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  status: scheduleStatusEnum.optional(),
});

export type CreateScheduleRequest = z.infer<typeof CreateScheduleInput>;
export type UpdateScheduleRequest = z.infer<typeof UpdateScheduleInput>;

// List params (from, to as ISO strings for query)
export interface ScheduleListParams {
  page?: number;
  pageSize?: number;
  jobId?: string;
  siteId?: string;
  pilotId?: string;
  droneId?: string;
  status?: ScheduleStatus;
  from?: string; // startAt >= from (ISO)
  to?: string;   // endAt <= to (ISO)
}

/* ---------- API Object ---------- */

export const schedulesApi = {
  getAll: async (
    params: ScheduleListParams = {}
  ): Promise<SchedulesResponse["data"]> => {
    const {
      page = 1,
      pageSize = 20,
      jobId,
      siteId,
      pilotId,
      droneId,
      status,
      from,
      to,
    } = params;
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("pageSize", String(pageSize));
    if (jobId) searchParams.set("jobId", jobId);
    if (siteId) searchParams.set("siteId", siteId);
    if (pilotId) searchParams.set("pilotId", pilotId);
    if (droneId) searchParams.set("droneId", droneId);
    if (status) searchParams.set("status", status);
    if (from) searchParams.set("from", from);
    if (to) searchParams.set("to", to);

    const response = await api.get<SchedulesResponse>(
      `/api/schduale?${searchParams}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Schedule> => {
    const response = await api.get<ScheduleResponse>(`/api/schduale/${id}`);
    return response.data.data.schduale;
  },

  getByJobId: async (jobId: string): Promise<Schedule[]> => {
    const response = await api.get<SchedulesByJobResponse>(
      `/api/job/${jobId}/schduale`
    );
    return response.data.data.items;
  },

  getAvailability: async (
    startAt: string,
    endAt: string
  ): Promise<AvailabilityResponse["data"]> => {
    const searchParams = new URLSearchParams({ startAt, endAt });
    const response = await api.get<AvailabilityResponse>(
      `/api/availability?${searchParams}`
    );
    return response.data.data;
  },

  create: async (data: CreateScheduleRequest): Promise<Schedule> => {
    const response = await api.post<ScheduleResponse>("/api/schduale", data);
    return response.data.data.schduale;
  },

  update: async (
    id: string,
    data: UpdateScheduleRequest
  ): Promise<Schedule> => {
    const response = await api.patch<ScheduleResponse>(
      `/api/schduale/${id}`,
      data
    );
    return response.data.data.schduale;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/schduale/${id}`);
  },
};

/* ---------- Query Keys ---------- */

export const scheduleKeys = {
  all: ["schedules"] as const,
  lists: () => [...scheduleKeys.all, "list"] as const,
  list: (params: ScheduleListParams) =>
    [...scheduleKeys.lists(), params] as const,
  details: () => [...scheduleKeys.all, "detail"] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
  byJob: (jobId: string) => [...scheduleKeys.all, "byJob", jobId] as const,
  availability: (startAt: string, endAt: string) =>
    [...scheduleKeys.all, "availability", startAt, endAt] as const,
};

/* ---------- Query Hooks ---------- */

export const useSchedules = (
  params: ScheduleListParams = {},
  options?: { initialData?: SchedulesResponse["data"] }
) => {
  return useQuery({
    queryKey: scheduleKeys.list(params),
    queryFn: () => schedulesApi.getAll(params),
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useSchedule = (
  id: string | null,
  options?: { initialData?: Schedule }
) => {
  return useQuery({
    queryKey: scheduleKeys.detail(id ?? ""),
    queryFn: () => schedulesApi.getById(id!),
    enabled: !!id,
    initialData: options?.initialData,
  });
};

export const useSchedulesByJob = (jobId: string | null) => {
  return useQuery({
    queryKey: scheduleKeys.byJob(jobId ?? ""),
    queryFn: () => schedulesApi.getByJobId(jobId!),
    enabled: !!jobId,
    staleTime: 1000 * 60 * 2,
  });
};

/** Use when building create/edit form to restrict pilot/drone options and avoid 409s */
export const useAvailability = (
  startAt: string | null,
  endAt: string | null
) => {
  return useQuery({
    queryKey: scheduleKeys.availability(startAt ?? "", endAt ?? ""),
    queryFn: () => schedulesApi.getAvailability(startAt!, endAt!),
    enabled: !!startAt && !!endAt && new Date(endAt) > new Date(startAt),
    staleTime: 1000 * 60, // 1 minute
  });
};

/* ---------- Error helpers (409 conflict) ---------- */

export interface ScheduleApiError extends Error {
  response?: {
    status?: number;
    data?: {
      error?: string;
      conflict?: ScheduleConflict;
      details?: { path: string; message: string }[];
    };
  };
}

export function getScheduleErrorMessage(err: ScheduleApiError): string {
  const data = err.response?.data;
  if (!data) return "Something went wrong";
  if (data.details?.length) {
    return data.details.map((d) => d.message).join(". ");
  }
  return data.error ?? "Something went wrong";
}

/** Returns conflict from 409 response; use to show blocking schedule (link, time range, etc.) */
export function getScheduleConflict(err: ScheduleApiError): ScheduleConflict | null {
  return err.response?.status === 409 && err.response?.data?.conflict
    ? err.response.data.conflict
    : null;
}

/* ---------- Mutation Hooks ---------- */

export const useCreateSchedule = (options?: {
  onSuccess?: (schedule: Schedule) => void;
  onConflict?: (error: ScheduleApiError, conflict: ScheduleConflict | null) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: schedulesApi.create,
    onSuccess: (schedule) => {
      queryClient.setQueryData(scheduleKeys.detail(schedule.id), schedule);
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.byJob(schedule.jobId),
      });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(schedule.jobId) });
      toast.success("Schedule created");
      options?.onSuccess?.(schedule);
    },
    onError: (error: ScheduleApiError) => {
      if (error.response?.status === 409) {
        const conflict = getScheduleConflict(error);
        options?.onConflict?.(error, conflict ?? null);
      }
      toast.error(getScheduleErrorMessage(error));
    },
  });
};

export const useUpdateSchedule = (options?: {
  onSuccess?: (schedule: Schedule) => void;
  onConflict?: (error: ScheduleApiError, conflict: ScheduleConflict | null) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduleRequest }) =>
      schedulesApi.update(id, data),
    onSuccess: (schedule) => {
      queryClient.setQueryData(scheduleKeys.detail(schedule.id), schedule);
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.byJob(schedule.jobId),
      });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(schedule.jobId) });
      toast.success("Schedule updated");
      options?.onSuccess?.(schedule);
    },
    onError: (error: ScheduleApiError) => {
      if (error.response?.status === 409) {
        const conflict = getScheduleConflict(error);
        options?.onConflict?.(error, conflict ?? null);
      }
      toast.error(getScheduleErrorMessage(error));
    },
  });
};

export const useDeleteSchedule = (options?: {
  onSuccess?: (scheduleId: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: schedulesApi.delete,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: scheduleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      toast.success("Schedule deleted");
      options?.onSuccess?.(id);
    },
    onError: (error: ScheduleApiError) => {
      toast.error(getScheduleErrorMessage(error));
    },
  });
};
