import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { z } from "zod";
import { toast } from "sonner";

/* ---------- Types & Schemas ---------- */

/** Backend enum: asset type */
export type AssetType =
  | "FACADE_WINDOWS"
  | "SOLAR_PANELS"
  | "AIRCRAFT_HANGAR"
  | "AIRCRAFT_APRON";

/** Backend enum: glass/surface type */
export type GlassSurfaceType =
  | "TEMPERED"
  | "LAMINATED"
  | "COATED"
  | "SOLAR_MONO"
  | "SOLAR_POLY";

/** Backend enum: access constraint */
export type AccessConstraint =
  | "ROAD_CLOSURE"
  | "NIGHT_ONLY"
  | "WIND_CORRIDOR"
  | "AIRPORT_OPS_WINDOW";

/** Display labels for enums */
export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  FACADE_WINDOWS: "Facade Windows",
  SOLAR_PANELS: "Solar Panels",
  AIRCRAFT_HANGAR: "Aircraft (Hangar)",
  AIRCRAFT_APRON: "Aircraft (Apron)",
};

export const GLASS_SURFACE_TYPE_LABELS: Record<GlassSurfaceType, string> = {
  TEMPERED: "Tempered",
  LAMINATED: "Laminated",
  COATED: "Coated",
  SOLAR_MONO: "Solar Mono",
  SOLAR_POLY: "Solar Poly",
};

export const ACCESS_CONSTRAINT_LABELS: Record<AccessConstraint, string> = {
  ROAD_CLOSURE: "Road closure",
  NIGHT_ONLY: "Night only",
  WIND_CORRIDOR: "Wind corridor",
  AIRPORT_OPS_WINDOW: "Airport ops window",
};

/** Supported UAE emirates for dropdown */
export const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;

export type EmiratesOption = (typeof EMIRATES)[number];

export interface Site {
  id: string;
  name: string;
  email: string;
  Description: string;
  siteManager: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  // Location
  code?: string;
  emirate?: string;
  city?: string;
  // Asset profile
  assetType?: AssetType;
  glassSurfaceType?: GlassSurfaceType;
  maxApprovedPressure?: number;
  height?: number;
  panelWidth?: number;
  panelHeight?: number;
  tetherRequired?: boolean;
  estimatedTime?: number;
  actualTime?: number;
  accessConstraints?: AccessConstraint[];
}

export interface Schedule {
  id: string;
  startAt: string;
  pilot?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  drone?: {
    id: string;
    name: string;
    serialNumber: string;
    status: string;
  };
}

export interface Job {
  id: string;
  createdAt: string;
  schduales?: Schedule[];
}

export interface SiteWithDetails extends Site {
  jobs?: Job[];
}

export interface SiteDetailsResponse {
  data: {
    site: SiteWithDetails;
  };
}

// API Response types
export interface SitesResponse {
  data: {
    items: Site[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface SiteResponse {
  data: {
    site: Site;
  };
}

export interface SiteCountResponse {
  data: {
    items: Site[];
    total: number;
  };
}

// Optional number (form may send "" for empty)
const optionalNumber = z
  .union([z.number(), z.string()])
  .optional()
  .transform((v) => {
    if (v === "" || v === undefined) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  })
  .pipe(z.number().min(0).optional());

// Request types
const assetTypeEnum = z.enum([
  "FACADE_WINDOWS",
  "SOLAR_PANELS",
  "AIRCRAFT_HANGAR",
  "AIRCRAFT_APRON",
]);
const glassSurfaceTypeEnum = z.enum([
  "TEMPERED",
  "LAMINATED",
  "COATED",
  "SOLAR_MONO",
  "SOLAR_POLY",
]);
const accessConstraintEnum = z.enum([
  "ROAD_CLOSURE",
  "NIGHT_ONLY",
  "WIND_CORRIDOR",
  "AIRPORT_OPS_WINDOW",
]);

export const CreateSiteInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional(),
  Description: z.string().optional(),
  siteManager: z.string().min(1, "Site manager name is required"),
  phone: z.string().min(6, "Phone is required"),
  code: z.string().optional(),
  emirate: z.string().optional(),
  city: z.string().optional(),
  assetType: assetTypeEnum.optional(),
  glassSurfaceType: glassSurfaceTypeEnum.optional(),
  maxApprovedPressure: optionalNumber,
  height: optionalNumber,
  panelWidth: optionalNumber,
  panelHeight: optionalNumber,
  tetherRequired: z.boolean().optional(),
  estimatedTime: optionalNumber,
  actualTime: optionalNumber,
  accessConstraints: z.array(accessConstraintEnum).optional(),
});

export const UpdateSiteInput = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  Description: z.string().optional(),
  siteManager: z.string().optional(),
  phone: z.string().min(6).optional(),
  code: z.string().optional(),
  emirate: z.string().optional(),
  city: z.string().optional(),
  assetType: assetTypeEnum.optional(),
  glassSurfaceType: glassSurfaceTypeEnum.optional(),
  maxApprovedPressure: optionalNumber,
  height: optionalNumber,
  panelWidth: optionalNumber,
  panelHeight: optionalNumber,
  tetherRequired: z.boolean().optional(),
  estimatedTime: optionalNumber,
  actualTime: optionalNumber,
  accessConstraints: z.array(accessConstraintEnum).optional(),
});

export type CreateSiteRequest = z.infer<typeof CreateSiteInput>;
export type UpdateSiteRequest = z.infer<typeof UpdateSiteInput>;

// Query params type
export interface SiteListParams {
  page?: number;
  pageSize?: number;
  q?: string;
  includeJobs?: boolean;
  emirate?: string;
  city?: string;
  assetType?: AssetType;
}

/* ---------- API Object ---------- */

export const sitesApi = {
  getAll: async (params: SiteListParams = {}): Promise<SitesResponse["data"]> => {
    const { page = 1, pageSize = 20, q, includeJobs, emirate, city, assetType } =
      params;
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("pageSize", String(pageSize));
    if (q) searchParams.set("q", q);
    if (includeJobs) searchParams.set("includeJobs", "true");
    if (emirate) searchParams.set("emirate", emirate);
    if (city) searchParams.set("city", city);
    if (assetType) searchParams.set("assetType", assetType);

    const response = await api.get<SitesResponse>(`/api/site?${searchParams}`);
    return response.data.data;
  },

  getLatest: async (limit = 5): Promise<Site[]> => {
    const response = await api.get<SitesResponse>(
      `/api/site?page=1&pageSize=${limit}`
    );
    return response.data.data.items;
  },

  getCount: async (): Promise<{ siteCount: number }> => {
    // Use minimal pageSize since we only need total count
    const response = await api.get<SitesResponse>("/api/site?page=1&pageSize=1");
    return { siteCount: response.data.data.total };
  },

  getById: async (id: string): Promise<Site> => {
    const response = await api.get<SiteResponse>(`/api/site/${id}`);
    return response.data.data.site;
  },

  getDetails: async (id: string): Promise<SiteWithDetails> => {
    const response = await api.get<SiteDetailsResponse>(`/api/site/${id}/details`);
    return response.data.data.site;
  },

  getJobsCount: async (id: string): Promise<number> => {
    const response = await api.get<{ data: { count: number } }>(
      `/api/site/${id}/jobs-count`
    );
    return response.data.data.count;
  },

  create: async (data: CreateSiteRequest): Promise<Site> => {
    const response = await api.post<SiteResponse>("/api/site", data);
    return response.data.data.site;
  },

  update: async (id: string, data: UpdateSiteRequest): Promise<Site> => {
    const response = await api.patch<SiteResponse>(`/api/site/${id}`, data);
    return response.data.data.site;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/site/${id}`);
  },
};

/* ---------- Query Keys ---------- */

export const siteKeys = {
  all: ["sites"] as const,
  lists: () => [...siteKeys.all, "list"] as const,
  list: (params: SiteListParams) => [...siteKeys.lists(), params] as const,
  details: () => [...siteKeys.all, "detail"] as const,
  detail: (id: string) => [...siteKeys.details(), id] as const,
  fullDetails: () => [...siteKeys.all, "fullDetail"] as const,
  fullDetail: (id: string) => [...siteKeys.fullDetails(), id] as const,
  jobsCount: (id: string) => [...siteKeys.all, "jobsCount", id] as const,
  count: () => [...siteKeys.all, "count"] as const,
  latest: (limit?: number) => [...siteKeys.all, "latest", limit ?? 5] as const,
};

/* ---------- Query Hooks ---------- */

// Get paginated list of sites
export const useSites = (
  params: SiteListParams = {},
  options?: { initialData?: SitesResponse["data"] }
) => {
  return useQuery({
    queryKey: siteKeys.list(params),
    queryFn: () => sitesApi.getAll(params),
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get latest sites (for dashboard widgets, etc.)
export const useLatestSites = (
  limit = 5,
  options?: { initialData?: Site[] }
) => {
  return useQuery({
    queryKey: siteKeys.latest(limit),
    queryFn: () => sitesApi.getLatest(limit),
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get site count
export const useSiteCount = (options?: {
  initialData?: { siteCount: number };
}) => {
  return useQuery({
    queryKey: siteKeys.count(),
    queryFn: sitesApi.getCount,
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get specific site (basic)
export const useSite = (id: string, options?: { initialData?: Site }) => {
  return useQuery({
    queryKey: siteKeys.detail(id),
    queryFn: () => sitesApi.getById(id),
    enabled: !!id,
    initialData: options?.initialData,
  });
};

// Get site with full details (including jobs and schedules)
export const useSiteDetails = (
  id: string | null,
  options?: { initialData?: SiteWithDetails }
) => {
  return useQuery({
    queryKey: siteKeys.fullDetail(id ?? ""),
    queryFn: () => sitesApi.getDetails(id!),
    enabled: !!id,
    initialData: options?.initialData,
  });
};

// Get jobs count for a site (lightweight, no joins)
export const useSiteJobsCount = (siteId: string | null) => {
  return useQuery({
    queryKey: siteKeys.jobsCount(siteId ?? ""),
    queryFn: () => sitesApi.getJobsCount(siteId!),
    enabled: !!siteId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/* ---------- Mutation Hooks ---------- */

// Create new site
export const useCreateSite = (options?: { onSuccess?: (site: Site) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sitesApi.create,
    onSuccess: (site) => {
      // Set detail cache for the new site
      queryClient.setQueryData(siteKeys.detail(site.id), site);

      // Invalidate list-related queries (can't safely prepend without knowing current params)
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: siteKeys.latest() });
      queryClient.invalidateQueries({ queryKey: siteKeys.count() });

      toast.success("Site created successfully");
      options?.onSuccess?.(site);
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      const message = error.response?.data?.error || "Failed to create site";
      toast.error(message);
    },
  });
};

// Update site
export const useUpdateSite = (options?: { onSuccess?: (site: Site) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSiteRequest }) =>
      sitesApi.update(id, data),
    onSuccess: (site) => {
      // Update detail cache directly
      queryClient.setQueryData(siteKeys.detail(site.id), site);

      // Invalidate lists (name/other fields may affect sorting/filtering)
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: siteKeys.latest() });

      toast.success("Site updated successfully");
      options?.onSuccess?.(site);
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      const message = error.response?.data?.error || "Failed to update site";
      toast.error(message);
    },
  });
};

// Delete site
export const useDeleteSite = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sitesApi.delete,
    onSuccess: (_, id) => {
      // Remove the detail cache for deleted site
      queryClient.removeQueries({ queryKey: siteKeys.detail(id) });

      // Invalidate lists and count
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: siteKeys.latest() });
      queryClient.invalidateQueries({ queryKey: siteKeys.count() });

      toast.success("Site deleted successfully");
      options?.onSuccess?.();
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      const message = error.response?.data?.error || "Failed to delete site";
      toast.error(message);
    },
  });
};
