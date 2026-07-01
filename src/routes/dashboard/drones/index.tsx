import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Plane, Plus, Loader2, Search } from "lucide-react";
import { useMemo, useCallback } from "react";
import {
  useDrones,
  dronesApi,
  droneKeys,
  type DroneListParams,
  DRONE_STATUS_LABELS,
  type DroneStatus,
} from "@/actions/drones";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DroneStatusBadge } from "@/components/status-badge";
import { StatusDot } from "@/components/status-dot";
import { EmptyState } from "@/components/empty-state";
import { SiteErrorFallback } from "@/components/site-error-fallback";
import { cn } from "@/lib/utils";

export type DronesSearch = {
  q?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

function parseNumber(val: unknown, defaultVal: number): number {
  if (val === undefined || val === null || val === "") return defaultVal;
  const n = Number(val);
  return Number.isNaN(n) ? defaultVal : Math.max(1, Math.floor(n));
}

const statusVariant: Record<DroneStatus, "live" | "warn" | "down"> = {
  AVAILABLE:      "live",
  MAINTENANCE:    "warn",
  OUT_OF_SERVICE: "down",
};

export const Route = createFileRoute("/dashboard/drones/")({
  component: DronesPage,
  validateSearch: (search: Record<string, unknown>): DronesSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    status: typeof search.status === "string" ? search.status : undefined,
    page: parseNumber(search.page, 1),
    pageSize: parseNumber(search.pageSize, 20),
  }),
  loader: async ({ context }) => {
    const defaultParams: DroneListParams = { page: 1, pageSize: 20 };
    context.queryClient.ensureQueryData({
      queryKey: droneKeys.list(defaultParams),
      queryFn: () => dronesApi.getAll(defaultParams),
    });
    return null;
  },
});

function DronesPage() {
  const navigate = useNavigate({ from: "/dashboard/drones/" });
  const search = Route.useSearch();
  const q = search.q ?? "";
  const status = search.status ?? "";
  const page = search.page ?? 1;
  const pageSize = search.pageSize ?? 20;

  const params = useMemo<DroneListParams>(
    () => ({
      page,
      pageSize,
      q: q || undefined,
      status: (status || undefined) as DroneStatus | undefined,
    }),
    [page, pageSize, q, status]
  );

  const { data, isLoading, error } = useDrones(params);

  const drones = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const setSearchParams = useCallback(
    (updates: Partial<DronesSearch>) => {
      navigate({
        search: (prev) => {
          const next = { ...prev, ...updates };
          if (next.page === 1) delete next.page;
          if (next.pageSize === 20) delete next.pageSize;
          if (!next.q) delete next.q;
          if (!next.status) delete next.status;
          return next;
        },
        replace: true,
      });
    },
    [navigate]
  );

  const setPage = (p: number) => setSearchParams({ page: p });

  if (error) {
    return <SiteErrorFallback error={error} title="Failed to load drones" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Drones</h1>
          <p className="text-muted-foreground">Manage your drone fleet</p>
        </div>
        <Link to="/dashboard/drones/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Drone
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col md:flex-row gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
              <Input
                placeholder="Search by name or serial..."
                value={q}
                onChange={(e) =>
                  setSearchParams({ q: e.target.value || undefined, page: 1 })
                }
                className="pl-9 focus-visible:ring-primary/50"
              />
            </div>
            <Select
              value={status || "all"}
              onValueChange={(v) =>
                setSearchParams({ status: v === "all" ? undefined : v, page: 1 })
              }
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(Object.keys(DRONE_STATUS_LABELS) as DroneStatus[]).map((k) => (
                  <SelectItem key={k} value={k}>{DRONE_STATUS_LABELS[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dense list */}
      <div className="rounded-[6px] border border-border overflow-hidden">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse bg-muted border-b border-border last:border-0" />
          ))
        ) : drones.length === 0 ? null : (
          drones.map((d) => {
            const serviceParts = [
              d.lastServiceAt
                ? `Last svc ${new Date(d.lastServiceAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  }).toUpperCase()}`
                : null,
              d.batteryCycles != null ? `${d.batteryCycles} cycles` : null,
            ].filter(Boolean);

            return (
              <Link
                key={d.id}
                to="/dashboard/drones/$droneId"
                params={{ droneId: d.id }}
                className={cn(
                  "relative flex items-center gap-4 px-4 h-16 group transition-colors",
                  "border-b border-border last:border-0",
                  "hover:bg-card/60",
                  "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                )}
              >
                <StatusDot variant={statusVariant[d.status as DroneStatus] ?? "idle"} />
                <span className="font-mono text-[11px] text-muted-foreground tracking-wide w-24 shrink-0 truncate">
                  {d.serialNumber}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm truncate">
                    {d.name}
                  </p>
                  {serviceParts.length > 0 && (
                    <p className="font-mono text-[10px] text-muted-foreground truncate mt-0.5">
                      {serviceParts.join(" · ")}
                    </p>
                  )}
                </div>
                <DroneStatusBadge
                  status={d.status}
                  label={DRONE_STATUS_LABELS[d.status as DroneStatus] ?? d.status}
                />
              </Link>
            );
          })
        )}
      </div>

      {!isLoading && drones.length === 0 && (
        <EmptyState
          icon={Plane}
          title="No drones found"
          description={q || status ? "Try adjusting filters" : "Add your first drone"}
          action={
            !q && !status
              ? { label: "Add Drone", to: "/dashboard/drones/new" }
              : undefined
          }
        />
      )}

      {!isLoading && drones.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="font-mono text-xs text-muted-foreground">
            {page}/{totalPages} · {total} total
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}

      {isLoading && drones.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
