import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Loader2, Search } from "lucide-react";
import { useMemo, useCallback } from "react";
import {
  useJobs,
  jobsApi,
  jobKeys,
  type JobListParams,
  JOB_TYPE_LABELS,
  type JobType,
} from "@/actions/jobs";
import { useSites } from "@/actions/sites";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatsCard } from "@/components/stats-card";
import { EmptyState } from "@/components/empty-state";
import { SiteErrorFallback } from "@/components/site-error-fallback";

export type JobsSearch = {
  q?: string;
  siteId?: string;
  type?: string;
  page?: number;
  pageSize?: number;
};

function parseNumber(val: unknown, defaultVal: number): number {
  if (val === undefined || val === null || val === "") return defaultVal;
  const n = Number(val);
  return Number.isNaN(n) ? defaultVal : Math.max(1, Math.floor(n));
}

export const Route = createFileRoute("/dashboard/jobs/")({
  component: JobsPage,
  validateSearch: (search: Record<string, unknown>): JobsSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    siteId: typeof search.siteId === "string" ? search.siteId : undefined,
    type: typeof search.type === "string" ? search.type : undefined,
    page: parseNumber(search.page, 1),
    pageSize: parseNumber(search.pageSize, 20),
  }),
  loader: async ({ context }) => {
    const defaultParams: JobListParams = { page: 1, pageSize: 20 };
    context.queryClient.ensureQueryData({
      queryKey: jobKeys.list(defaultParams),
      queryFn: () => jobsApi.getAll(defaultParams),
    });
    return null;
  },
});

function JobsPage() {
  const navigate = useNavigate({ from: "/dashboard/jobs/" });
  const search = Route.useSearch();
  const q = search.q ?? "";
  const siteId = search.siteId ?? "";
  const type = search.type ?? "";
  const page = search.page ?? 1;
  const pageSize = search.pageSize ?? 20;

  const params = useMemo<JobListParams>(
    () => ({
      page,
      pageSize,
      q: q || undefined,
      siteId: siteId || undefined,
      type: (type || undefined) as JobType | undefined,
    }),
    [page, pageSize, q, siteId, type]
  );

  const { data, isLoading, error } = useJobs(params);
  const { data: sitesData } = useSites({ pageSize: 100 });
  const sites = sitesData?.items ?? [];

  const jobs = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const setSearchParams = useCallback(
    (updates: Partial<JobsSearch>) => {
      navigate({
        search: (prev) => {
          const next = { ...prev, ...updates };
          if (next.page === 1) delete next.page;
          if (next.pageSize === 20) delete next.pageSize;
          if (!next.q) delete next.q;
          if (!next.siteId) delete next.siteId;
          if (!next.type) delete next.type;
          return next;
        },
        replace: true,
      });
    },
    [navigate]
  );

  const setPage = (p: number) => setSearchParams({ page: p });

  if (error) {
    return <SiteErrorFallback error={error} title="Failed to load jobs" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Briefcase className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
            <p className="text-muted-foreground">Track and manage your jobs</p>
          </div>
        </div>
        <Link to="/dashboard/jobs/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          title="Total Jobs"
          value={total}
          icon={Briefcase}
          iconColor="text-green-500"
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
                  placeholder="Search by job name..."
                  value={q}
                  onChange={(e) => setSearchParams({ q: e.target.value || undefined, page: 1 })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={siteId || "all"}
              onValueChange={(v) =>
                setSearchParams({ siteId: v === "all" ? undefined : v, page: 1 })
              }
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sites</SelectItem>
                {sites.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={type || "all"}
              onValueChange={(v) =>
                setSearchParams({ type: v === "all" ? undefined : v, page: 1 })
              }
            >
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {JOB_TYPE_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(pageSize)}
              onValueChange={(v) =>
                setSearchParams({ pageSize: Number(v), page: 1 })
              }
            >
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-20 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))
          : jobs.map((job) => (
              <Link
                key={job.id}
                to="/dashboard/jobs/$jobId/edit"
                params={{ jobId: job.id }}
              >
                <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium line-clamp-1">{job.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.site?.name ?? job.siteId}
                        </p>
                        <span className="inline-block mt-2 text-xs rounded-md bg-muted px-2 py-0.5">
                          {JOB_TYPE_LABELS[job.type]}
                        </span>
                      </div>
                      <Briefcase className="h-5 w-5 text-green-500 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {!isLoading && jobs.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description={q || siteId || type ? "Try adjusting filters" : "Create your first job"}
          action={
            !q && !siteId && !type
              ? { label: "Add Job", to: "/dashboard/jobs/new" }
              : undefined
          }
        />
      )}

      {!isLoading && jobs.length > 0 && totalPages > 1 && (
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

      {isLoading && jobs.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
