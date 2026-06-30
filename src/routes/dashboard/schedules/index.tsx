import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Loader2, List, CalendarDays } from "lucide-react";
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
import { ScheduleStatusBadge } from "@/components/status-badge";
import { StatusDot } from "@/components/status-dot";
import { FilterDatePicker } from "@/components/filter-date-picker";
import { EmptyState } from "@/components/empty-state";
import { SiteErrorFallback } from "@/components/site-error-fallback";
import { ScheduleCalendar } from "@/features/calendar/schedule-calendar";
import { getViewRange } from "@/features/calendar/helpers";
import { cn } from "@/lib/utils";

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

const statusDotVariant: Record<ScheduleStatus, "live" | "warn" | "ok" | "idle"> = {
  IN_PROGRESS: "live",
  ASSIGNED:    "warn",
  COMPLETED:   "ok",
  CANCELLED:   "idle",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  }).toUpperCase();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Dubai",
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
    return <SiteErrorFallback error={error} title="Failed to load schedules" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedules</h1>
          <p className="text-muted-foreground">Plan and manage schedules</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex rounded-[6px] border border-border bg-muted/30 p-0.5">
            <Button
              variant={!isCalendarView ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3 font-sans text-xs"
              onClick={() => setSearchParams({ view: "list" })}
            >
              <List className="h-3.5 w-3.5 mr-1.5" />
              List
            </Button>
            <Button
              variant={isCalendarView ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3 font-sans text-xs"
              onClick={() => setSearchParams({ view: "calendar" })}
            >
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
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
          {/* Filters */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col md:flex-row gap-3 flex-wrap">
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
                      <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
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
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
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
                    {(Object.keys(SCHEDULE_STATUS_LABELS) as ScheduleStatus[]).map((k) => (
                      <SelectItem key={k} value={k}>{SCHEDULE_STATUS_LABELS[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 flex-wrap">
                  <FilterDatePicker
                    label="From"
                    value={from}
                    onChange={(iso) => setSearchParams({ from: iso, page: 1 })}
                  />
                  <FilterDatePicker
                    label="To"
                    value={to}
                    onChange={(iso) => setSearchParams({ to: iso, page: 1 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dense list */}
          <div className="rounded-[6px] border border-border overflow-hidden">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-[72px] animate-pulse bg-muted border-b border-border last:border-0" />
              ))
            ) : schedules.length === 0 ? null : (
              schedules.map((s) => {
                const statusLabel = SCHEDULE_STATUS_LABELS[s.status as ScheduleStatus] ?? s.status;
                const dateStr = formatDate(s.startAt);
                const timeStr = formatTime(s.startAt);
                const siteName = s.job?.site?.name ?? "—";
                const jobName = s.job?.name ?? s.jobId;
                const pilotName = s.pilot?.name ?? "—";
                const droneSerial = s.drone?.serialNumber ?? s.drone?.name ?? "—";

                return (
                  <Link
                    key={s.id}
                    to="/dashboard/schedules/$scheduleId"
                    params={{ scheduleId: s.id }}
                    className={cn(
                      "relative flex items-stretch border-b border-border last:border-0 transition-colors overflow-hidden",
                      "hover:bg-card/60",
                      "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                    )}
                  >
                    {/* Date + time rail */}
                    <div className="flex flex-col items-start justify-center gap-0.5 w-[72px] shrink-0 px-3 py-3 border-r border-border/50">
                      <span className="font-mono text-[11px] font-semibold text-foreground leading-none">
                        {dateStr.split(" ")[0]}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground leading-none">
                        {dateStr.split(" ").slice(1).join(" ")}
                      </span>
                      <span className="font-mono text-[11px] text-primary mt-1 leading-none">
                        {timeStr}
                      </span>
                    </div>

                    {/* Schedule details */}
                    <div className="flex flex-1 items-center gap-3 px-4 py-3 min-w-0">
                      <StatusDot
                        variant={statusDotVariant[s.status as ScheduleStatus] ?? "idle"}
                        pulse={s.status === "IN_PROGRESS"}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-sm leading-tight truncate">
                          {siteName !== "—" ? `${siteName} — ` : ""}{jobName}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">
                          {pilotName} · {droneSerial}
                        </p>
                      </div>
                      <ScheduleStatusBadge status={s.status} label={statusLabel} />
                    </div>
                    {s.status === "IN_PROGRESS" && (() => {
                      const pct = Math.min(100, Math.max(0,
                        (Date.now() - new Date(s.startAt).getTime()) /
                        (new Date(s.endAt).getTime() - new Date(s.startAt).getTime()) * 100
                      ));
                      return <div className="absolute bottom-0 left-0 h-px bg-primary" style={{ width: `${pct}%` }} />;
                    })()}
                  </Link>
                );
              })
            )}
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
