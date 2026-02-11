import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { z } from "zod";
import { toast } from "sonner";
import { siteKeys } from "./sites";

/* ---------- Types & Schemas ---------- */

/** Backend enum: job type */
export type JobType = "INSPECTION" | "CLEANING";

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  INSPECTION: "Inspection",
  CLEANING: "Cleaning",
};

/** Schedule (schduales) as returned by GET /api/job/:id or list with includeSchedules */
export interface JobSchedule {
  id: string;
  startAt: string;
  endAt?: string;
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

/** Job as returned by API (list item or single) */
export interface Job {
  id: string;
  name: string;
  siteId: string;
  type: JobType;
  createdAt: string;
  updatedAt: string;
  site?: {
    id: string;
    name: string;
  };
  schduales?: JobSchedule[];
}

// API Response types
export interface JobsResponse {
  data: {
    items: Job[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface JobResponse {
  data: {
    job: Job;
  };
}

// Request types (Zod)
const jobTypeEnum = z.enum(["INSPECTION", "CLEANING"]);

export const CreateJobInput = z.object({
  name: z.string().min(1, "Name is required"),
  siteId: z.string().uuid("Invalid site"),
  type: jobTypeEnum,
});

export const UpdateJobInput = z.object({
  name: z.string().min(1).optional(),
  type: jobTypeEnum.optional(),
});

export type CreateJobRequest = z.infer<typeof CreateJobInput>;
export type UpdateJobRequest = z.infer<typeof UpdateJobInput>;

// List params
export interface JobListParams {
  page?: number;
  pageSize?: number;
  siteId?: string;
  type?: JobType;
  q?: string;
  includeSchedules?: boolean;
}

/* ---------- API Object ---------- */

export const jobsApi = {
  getAll: async (params: JobListParams = {}): Promise<JobsResponse["data"]> => {
    const {
      page = 1,
      pageSize = 20,
      siteId,
      type,
      q,
      includeSchedules,
    } = params;
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("pageSize", String(pageSize));
    if (siteId) searchParams.set("siteId", siteId);
    if (type) searchParams.set("type", type);
    if (q) searchParams.set("q", q);
    if (includeSchedules) searchParams.set("includeSchedules", "true");

    const response = await api.get<JobsResponse>(`/api/job?${searchParams}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<Job> => {
    const response = await api.get<JobResponse>(`/api/job/${id}`);
    return response.data.data.job;
  },

  create: async (data: CreateJobRequest): Promise<Job> => {
    const response = await api.post<JobResponse>("/api/job", data);
    return response.data.data.job;
  },

  update: async (id: string, data: UpdateJobRequest): Promise<Job> => {
    const response = await api.patch<JobResponse>(`/api/job/${id}`, data);
    return response.data.data.job;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/job/${id}`);
  },
};

/* ---------- Query Keys ---------- */

export const jobKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobKeys.all, "list"] as const,
  list: (params: JobListParams) => [...jobKeys.lists(), params] as const,
  details: () => [...jobKeys.all, "detail"] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
};

/* ---------- Query Hooks ---------- */

export const useJobs = (
  params: JobListParams = {},
  options?: { initialData?: JobsResponse["data"] }
) => {
  return useQuery({
    queryKey: jobKeys.list(params),
    queryFn: () => jobsApi.getAll(params),
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useJob = (id: string | null, options?: { initialData?: Job }) => {
  return useQuery({
    queryKey: jobKeys.detail(id ?? ""),
    queryFn: () => jobsApi.getById(id!),
    enabled: !!id,
    initialData: options?.initialData,
  });
};

/* ---------- Mutation Hooks ---------- */

function getJobErrorMessage(
  error: Error & { response?: { data?: { error?: string; details?: { path: string; message: string }[] } } }
): string {
  const data = error.response?.data;
  if (!data) return "Something went wrong";
  if (data.details?.length) {
    return data.details.map((d) => d.message).join(". ");
  }
  return data.error ?? "Something went wrong";
}

export const useCreateJob = (options?: { onSuccess?: (job: Job) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobsApi.create,
    onSuccess: (job) => {
      queryClient.setQueryData(jobKeys.detail(job.id), job);
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: siteKeys.all }); // refresh site jobs count
      toast.success("Job created successfully");
      options?.onSuccess?.(job);
    },
    onError: (error) => {
      toast.error(getJobErrorMessage(error));
    },
  });
};

export const useUpdateJob = (options?: { onSuccess?: (job: Job) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobRequest }) =>
      jobsApi.update(id, data),
    onSuccess: (job) => {
      queryClient.setQueryData(jobKeys.detail(job.id), job);
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      toast.success("Job updated successfully");
      options?.onSuccess?.(job);
    },
    onError: (error) => {
      toast.error(getJobErrorMessage(error));
    },
  });
};

export const useDeleteJob = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobsApi.delete,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: jobKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: siteKeys.all }); // refresh site jobs count
      toast.success("Job deleted successfully");
      options?.onSuccess?.();
    },
    onError: (
      error: Error & { response?: { status?: number; data?: { error?: string } } }
    ) => {
      if (error.response?.status === 409) {
        toast.error(
          error.response?.data?.error ??
            "Cannot delete job with schedules. Cancel/delete schedules first."
        );
        return;
      }
      toast.error(getJobErrorMessage(error));
    },
  });
};
