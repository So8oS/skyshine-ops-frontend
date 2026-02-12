import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { z } from "zod";
import { toast } from "sonner";
import { scheduleKeys } from "./schedules";

/* ---------- Types & Schemas ---------- */

/** Backend enum: drone status */
export type DroneStatus = "AVAILABLE" | "MAINTENANCE" | "OUT_OF_SERVICE";

export const DRONE_STATUS_LABELS: Record<DroneStatus, string> = {
  AVAILABLE: "Available",
  MAINTENANCE: "Maintenance",
  OUT_OF_SERVICE: "Out of service",
};

/** Schedule snippet when drone is loaded with getById (includes schduals) */
export interface DroneSchedule {
  id: string;
  startAt: string;
  endAt: string;
  status?: string;
  pilot?: { id: string; name: string; email?: string; phone?: string };
  job?: {
    id: string;
    name: string;
    siteId?: string;
    type?: string;
    site?: { id: string; name: string };
  };
}

/** Drone as returned by API (list item or single) */
export interface Drone {
  id: string;
  name: string;
  serialNumber: string;
  status: DroneStatus;
  createdAt: string;
  updatedAt: string;
  schduals?: DroneSchedule[];
}

// API Response types
export interface DronesResponse {
  data: {
    items: Drone[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface DroneResponse {
  data: {
    drone: Drone;
  };
}

// Request types (Zod)
const droneStatusEnum = z.enum(["AVAILABLE", "MAINTENANCE", "OUT_OF_SERVICE"]);

export const CreateDroneInput = z.object({
  name: z.string().min(1, "Name is required"),
  serialNumber: z.string().min(3, "Serial number is required"),
  status: droneStatusEnum.optional(),
});

export const UpdateDroneInput = z.object({
  name: z.string().min(1).optional(),
  serialNumber: z.string().min(3).optional(),
  status: droneStatusEnum.optional(),
});

export type CreateDroneRequest = z.infer<typeof CreateDroneInput>;
export type UpdateDroneRequest = z.infer<typeof UpdateDroneInput>;

// List params
export interface DroneListParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: DroneStatus;
  includeSchedules?: boolean;
}

/* ---------- API Object ---------- */

export const dronesApi = {
  getAll: async (params: DroneListParams = {}): Promise<DronesResponse["data"]> => {
    const {
      page = 1,
      pageSize = 20,
      q,
      status,
      includeSchedules,
    } = params;
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("pageSize", String(pageSize));
    if (q) searchParams.set("q", q);
    if (status) searchParams.set("status", status);
    if (includeSchedules) searchParams.set("includeSchedules", "true");

    const response = await api.get<DronesResponse>(`/api/drone?${searchParams}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<Drone> => {
    const response = await api.get<DroneResponse>(`/api/drone/${id}`);
    return response.data.data.drone;
  },

  create: async (data: CreateDroneRequest): Promise<Drone> => {
    const response = await api.post<DroneResponse>("/api/drone", data);
    return response.data.data.drone;
  },

  update: async (id: string, data: UpdateDroneRequest): Promise<Drone> => {
    const response = await api.patch<DroneResponse>(`/api/drone/${id}`, data);
    return response.data.data.drone;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/drone/${id}`);
  },
};

/* ---------- Query Keys ---------- */

export const droneKeys = {
  all: ["drones"] as const,
  lists: () => [...droneKeys.all, "list"] as const,
  list: (params: DroneListParams) => [...droneKeys.lists(), params] as const,
  details: () => [...droneKeys.all, "detail"] as const,
  detail: (id: string) => [...droneKeys.details(), id] as const,
};

/* ---------- Query Hooks ---------- */

export const useDrones = (
  params: DroneListParams = {},
  options?: { initialData?: DronesResponse["data"] }
) => {
  return useQuery({
    queryKey: droneKeys.list(params),
    queryFn: () => dronesApi.getAll(params),
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDrone = (id: string | null, options?: { initialData?: Drone }) => {
  return useQuery({
    queryKey: droneKeys.detail(id ?? ""),
    queryFn: () => dronesApi.getById(id!),
    enabled: !!id,
    initialData: options?.initialData,
  });
};

/* ---------- Mutation Hooks ---------- */

function getDroneErrorMessage(
  error: Error & {
    response?: { data?: { error?: string; details?: { path: string; message: string }[] } };
  }
): string {
  const data = error.response?.data;
  if (!data) return "Something went wrong";
  if (data.details?.length) {
    return data.details.map((d) => d.message).join(". ");
  }
  return data.error ?? "Something went wrong";
}

export const useCreateDrone = (options?: { onSuccess?: (drone: Drone) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dronesApi.create,
    onSuccess: (drone) => {
      queryClient.setQueryData(droneKeys.detail(drone.id), drone);
      queryClient.invalidateQueries({ queryKey: droneKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      toast.success("Drone created successfully");
      options?.onSuccess?.(drone);
    },
    onError: (error) => {
      toast.error(getDroneErrorMessage(error));
    },
  });
};

export const useUpdateDrone = (options?: { onSuccess?: (drone: Drone) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDroneRequest }) =>
      dronesApi.update(id, data),
    onSuccess: (drone) => {
      queryClient.setQueryData(droneKeys.detail(drone.id), drone);
      queryClient.invalidateQueries({ queryKey: droneKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      toast.success("Drone updated successfully");
      options?.onSuccess?.(drone);
    },
    onError: (error) => {
      toast.error(getDroneErrorMessage(error));
    },
  });
};

export const useDeleteDrone = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dronesApi.delete,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: droneKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: droneKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
      toast.success("Drone deleted successfully");
      options?.onSuccess?.();
    },
    onError: (
      error: Error & { response?: { status?: number; data?: { error?: string } } }
    ) => {
      if (error.response?.status === 409) {
        toast.error(
          error.response?.data?.error ??
            "Cannot delete drone with schedules. Cancel/delete schedules first."
        );
        return;
      }
      toast.error(getDroneErrorMessage(error));
    },
  });
};
