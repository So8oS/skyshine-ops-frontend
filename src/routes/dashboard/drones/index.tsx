import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plane, Plus, Loader2, Pencil, Search } from "lucide-react";
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
import { StatsCard } from "@/components/stats-card";
import { EmptyState } from "@/components/empty-state";
import { SiteErrorFallback } from "@/components/site-error-fallback";

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
    return (
      <SiteErrorFallback error={error} title="Failed to load drones" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Plane className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Drones</h1>
            <p className="text-muted-foreground">Manage your drone fleet</p>
          </div>
        </div>
        <Link to="/dashboard/drones/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Drone
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          title="Total Drones"
          value={total}
          icon={Plane}
          iconColor="text-orange-500"
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or serial..."
                  value={q}
                  onChange={(e) =>
                    setSearchParams({ q: e.target.value || undefined, page: 1 })
                  }
                  className="pl-10"
                />
              </div>
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
                {(Object.keys(DRONE_STATUS_LABELS) as DroneStatus[]).map(
                  (k) => (
                    <SelectItem key={k} value={k}>
                      {DRONE_STATUS_LABELS[k]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Select
              value={String(pageSize)}
              onValueChange={(v) =>
                setSearchParams({ pageSize: Number(v), page: 1 })
              }
            >
              <SelectTrigger className="w-full md:w-[120px]">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4} className="py-6">
                      <div className="h-6 animate-pulse rounded bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              : drones.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Link
                        to="/dashboard/drones/$droneId"
                        params={{ droneId: d.id }}
                        className="font-medium text-muted-foreground hover:text-foreground"
                      >
                        {d.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {d.serialNumber}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                        {DRONE_STATUS_LABELS[d.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to="/dashboard/drones/$droneId/edit"
                        params={{ droneId: d.id }}
                      >
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && drones.length === 0 && (
        <EmptyState
          icon={Plane}
          title="No drones found"
          description={
            q || status ? "Try adjusting filters" : "Add your first drone"
          }
          action={
            !q && !status
              ? { label: "Add Drone", to: "/dashboard/drones/new" }
              : undefined
          }
        />
      )}

      {!isLoading && drones.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
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
