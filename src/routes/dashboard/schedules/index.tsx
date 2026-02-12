import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Loader2, Pencil, List, CalendarDays } from "lucide-react";
import { useMemo, useCallback, useState } from "react";
import {
  useSchedules,
  schedulesApi,
  scheduleKeys,
  type ScheduleListParams,
  SCHEDULE_STATUS_LABELS,
  type ScheduleStatus,
} from "@/actions/schedules";
import { useJobs } from "@/actions/jobs";
import { useSites } from "@/actions/sites";
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
import { ScheduleCalendar } from "@/features/calendar/schedule-calendar";
import { getViewRange } from "@/features/calendar/helpers";

export type CalendarView = "day" | "week" | "month";


export type SchedulesSearch = {
  view?: "list" | "calendar";
  jobId?: string;
  siteId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

function parseNumber(val: unknown, defaultVal: number): number {
  if (val === undefined || val === null || val === "") return defaultVal;
  const n = Number(val);
  return Number.isNaN(n) ? defaultVal : Math.max(1, Math.floor(n));
}

export const Route = createFileRoute("/dashboard/schedules/")({
  component: SchedulesPage,
  validateSearch: (search: Record<string, unknown>): SchedulesSearch => ({
    view: search.view === "calendar" ? "calendar" : "list",
    jobId: typeof search.jobId === "string" ? search.jobId : undefined,
    siteId: typeof search.siteId === "string" ? search.siteId : undefined,
    status: typeof search.status === "string" ? search.status : undefined,
    from: typeof search.from === "string" ? search.from : undefined,
    to: typeof search.to === "string" ? search.to : undefined,
    page: parseNumber(search.page, 1),
    pageSize: parseNumber(search.pageSize, 20),
  }),
  loader: async ({ context }) => {
    const defaultParams: ScheduleListParams = { page: 1, pageSize: 20 };
    context.queryClient.ensureQueryData({
      queryKey: scheduleKeys.list(defaultParams),
      queryFn: () => schedulesApi.getAll(defaultParams),
    });
    return null;
  },
});

function formatScheduleTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function SchedulesPage() {
  const navigate = useNavigate({ from: "/dashboard/schedules/" });
  const search = Route.useSearch();
  const isCalendarView = search.view === "calendar";
  const jobId = search.jobId ?? "";
  const siteId = search.siteId ?? "";
  const status = search.status ?? "";
  const from = search.from ?? "";
  const to = search.to ?? "";
  const page = search.page ?? 1;
  const pageSize = search.pageSize ?? 20;

  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const calendarRange = useMemo(
    () => getViewRange(calendarDate, calendarView),
    [calendarDate, calendarView]
  );

  const listParams = useMemo<ScheduleListParams>(
    () => ({
      page,
      pageSize,
      jobId: jobId || undefined,
      siteId: siteId || undefined,
      status: (status || undefined) as ScheduleStatus | undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [page, pageSize, jobId, siteId, status, from, to]
  );

  const calendarParams = useMemo<ScheduleListParams>(
    () => ({
      page: 1,
      pageSize: 100,
      jobId: jobId || undefined,
      siteId: siteId || undefined,
      status: (status || undefined) as ScheduleStatus | undefined,
      from: calendarRange.start.toISOString(),
      to: calendarRange.end.toISOString(),
    }),
    [calendarRange.start, calendarRange.end, jobId, siteId, status]
  );

  const params = isCalendarView ? calendarParams : listParams;
  const { data, isLoading, error } = useSchedules(params);
  const { data: jobsData } = useJobs({ pageSize: 100 });
  const { data: sitesData } = useSites({ pageSize: 100 });
  const jobs = jobsData?.items ?? [];
  const sites = sitesData?.items ?? [];

  const schedules = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const setSearchParams = useCallback(
    (updates: Partial<SchedulesSearch>) => {
      navigate({
        search: (prev) => {
          const next = { ...prev, ...updates };
          if (next.view === "list") delete next.view;
          if (next.page === 1) delete next.page;
          if (next.pageSize === 20) delete next.pageSize;
          if (!next.jobId) delete next.jobId;
          if (!next.siteId) delete next.siteId;
          if (!next.status) delete next.status;
          if (!next.from) delete next.from;
          if (!next.to) delete next.to;
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
      <SiteErrorFallback error={error} title="Failed to load schedules" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Calendar className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Schedules</h1>
            <p className="text-muted-foreground">Plan and manage schedules</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border bg-muted/30 p-0.5">
            <Button
              variant={!isCalendarView ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-3"
              onClick={() => setSearchParams({ view: "list" })}
            >
              <List className="h-4 w-4 mr-1.5" />
              List
            </Button>
            <Button
              variant={isCalendarView ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-3"
              onClick={() => setSearchParams({ view: "calendar" })}
            >
              <CalendarDays className="h-4 w-4 mr-1.5" />
              Calendar
            </Button>
          </div>
          <Link to="/dashboard/schedules/new" className="w-full md:w-auto">
            <Button className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </Link>
        </div>
      </div>

      {!isCalendarView && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatsCard
            title="Total Schedules"
            value={total}
            icon={Calendar}
            iconColor="text-purple-500"
            isLoading={isLoading}
          />
        </div>
      )}

      {isCalendarView ? (
        <ScheduleCalendar
          schedules={schedules}
          date={calendarDate}
          view={calendarView}
          onDateChange={setCalendarDate}
          onViewChange={setCalendarView}
        />
      ) : (
        <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            <Select
              value={jobId || "all"}
              onValueChange={(v) =>
                setSearchParams({ jobId: v === "all" ? undefined : v, page: 1 })
              }
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All jobs</SelectItem>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={siteId || "all"}
              onValueChange={(v) =>
                setSearchParams({ siteId: v === "all" ? undefined : v, page: 1 })
              }
            >
              <SelectTrigger className="w-full md:w-[180px]">
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
              value={status || "all"}
              onValueChange={(v) =>
                setSearchParams({ status: v === "all" ? undefined : v, page: 1 })
              }
            >
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(Object.keys(SCHEDULE_STATUS_LABELS) as ScheduleStatus[]).map(
                  (k) => (
                    <SelectItem key={k} value={k}>
                      {SCHEDULE_STATUS_LABELS[k]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">From (start ≥)</label>
                <Input
                  type="datetime-local"
                  value={from ? from.slice(0, 16) : ""}
                  onChange={(e) =>
                    setSearchParams({
                      from: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      page: 1,
                    })
                  }
                  className="w-full md:w-[180px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">To (end ≤)</label>
                <Input
                  type="datetime-local"
                  value={to ? to.slice(0, 16) : ""}
                  onChange={(e) =>
                    setSearchParams({
                      to: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      page: 1,
                    })
                  }
                  className="w-full md:w-[180px]"
                />
              </div>
            </div>
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

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 px-4 text-left font-medium">Site</th>
              <th className="h-10 px-4 text-left font-medium">Status</th>
              <th className="h-10 px-4 text-left font-medium">Pilot</th>
              <th className="h-10 px-4 text-left font-medium">Drone</th>
              <th className="h-10 px-4 text-left font-medium">Job</th>
              <th className="h-10 px-4 text-left font-medium">Start</th>
              <th className="h-10 px-4 text-left font-medium">End</th>
              <th className="h-10 px-4 text-right font-medium w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td colSpan={8} className="px-4 py-6">
                      <div className="h-6 animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))
              : schedules.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to="/dashboard/schedules/$scheduleId"
                        params={{ scheduleId: s.id }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {s.job?.site?.name ?? "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                        {SCHEDULE_STATUS_LABELS[s.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.pilot?.name ?? s.pilotId}
                    </td>
                    <td className="px-4 py-3">
                      {s.drone?.name ?? s.droneId}
                      {s.drone?.serialNumber ? (
                        <span className="text-muted-foreground ml-1">
                          ({s.drone.serialNumber})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <Link
                        to="/dashboard/schedules/$scheduleId"
                        params={{ scheduleId: s.id }}
                        className="hover:underline"
                      >
                        {s.job?.name ?? s.jobId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatScheduleTime(s.startAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatScheduleTime(s.endAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/dashboard/schedules/$scheduleId/edit"
                        params={{ scheduleId: s.id }}
                      >
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {!isLoading && schedules.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="No schedules found"
          description={
            jobId || siteId || status || from || to
              ? "Try adjusting filters"
              : "Create your first schedule"
          }
          action={
            !jobId && !siteId && !status && !from && !to
              ? { label: "Add Schedule", to: "/dashboard/schedules/new" }
              : undefined
          }
        />
      )}

      {!isLoading && schedules.length > 0 && totalPages > 1 && (
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

      {isLoading && schedules.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
        </>
      )}
    </div>
  );
}
