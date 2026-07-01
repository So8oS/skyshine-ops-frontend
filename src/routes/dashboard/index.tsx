import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useEffect, useState } from "react";
import { useUser } from "@/actions/auth";
import WeeklyWeatherCalendar from "@/components/weather";
import { useStatisticsOverview, useJobStats } from "@/actions/statistics";
import { useSchedules, type ScheduleStatus } from "@/actions/schedules";
import { useDrones, DRONE_STATUS_LABELS, type DroneStatus } from "@/actions/drones";
import { FleetSnapshot } from "@/components/fleet-snapshot";
import { LiveOpsFeed } from "@/components/live-ops-feed";
import { SegmentedBar, type Segment } from "@/components/segmented-bar";
import { DroneStatusBadge } from "@/components/status-badge";
import { StatusDot } from "@/components/status-dot";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

/* ---------- Helpers ---------- */

const UAE_TZ = "Asia/Dubai";

function getGreeting(firstName: string): string {
  const hour = parseInt(
    new Intl.DateTimeFormat("en-GB", { timeZone: UAE_TZ, hour: "numeric", hour12: false }).format(new Date()),
    10
  );
  let prefix: string;
  if (hour >= 5 && hour < 12)       prefix = "Good morning";
  else if (hour >= 12 && hour < 17)  prefix = "Afternoon";
  else if (hour >= 17 && hour < 21)  prefix = "Evening";
  else                               prefix = "Burning the midnight oil";
  return `${prefix}${firstName ? `, ${firstName}.` : "."}`;
}

function getAUHDate(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: UAE_TZ,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date())
    .toUpperCase()
    .replace(/,/g, " ·");
}

function todayRange(): { from: string; to: string } {
  const now = new Date();
  const auhOffset = 4 * 60;
  const localOffset = -now.getTimezoneOffset();
  const diff = (auhOffset - localOffset) * 60000;
  const auhNow = new Date(now.getTime() + diff);

  const startOfDay = new Date(auhNow);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(auhNow);
  endOfDay.setHours(23, 59, 59, 999);

  return {
    from: new Date(startOfDay.getTime() - diff).toISOString(),
    to: new Date(endOfDay.getTime() - diff).toISOString(),
  };
}

/* ---------- Today's Timeline ---------- */

const TIMELINE_START_H = 6;
const TIMELINE_END_H = 22;
const TIMELINE_DURATION_MS = (TIMELINE_END_H - TIMELINE_START_H) * 3600000;

const statusTimelineColor: Record<ScheduleStatus, string> = {
  ASSIGNED:    "var(--primary)",
  IN_PROGRESS: "var(--teal)",
  COMPLETED:   "var(--success)",
  CANCELLED:   "var(--muted-foreground)",
};

function calcNowPct(): number {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(TIMELINE_START_H, 0, 0, 0);
  return Math.min(100, Math.max(0, ((now.getTime() - todayStart.getTime()) / TIMELINE_DURATION_MS) * 100));
}

function TodayTimeline() {
  const range = useMemo(() => todayRange(), []);
  const [nowPct, setNowPct] = useState(() => calcNowPct());

  useEffect(() => {
    const id = setInterval(() => setNowPct(calcNowPct()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { data, isLoading } = useSchedules(
    { from: range.from, to: range.to, pageSize: 100 },
    { refetchInterval: 60_000 }
  );

  const schedules = data?.items ?? [];

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(TIMELINE_START_H, 0, 0, 0);
    return d;
  }, []);

  const hours = Array.from({ length: TIMELINE_END_H - TIMELINE_START_H + 1 }, (_, i) => i + TIMELINE_START_H);

  if (isLoading) {
    return <div className="h-24 animate-pulse rounded-[3px] bg-muted" />;
  }

  return (
    <div className="relative overflow-x-auto">
      {/* Hour markers */}
      <div className="relative h-5 flex border-b border-border">
        {hours.map((h) => (
          <div
            key={h}
            className="flex-1 flex items-end pb-0.5"
          >
            <span className="font-mono text-[9px] text-muted-foreground/50">
              {String(h).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>

      {/* Schedule slots */}
      <div className="relative mt-1 h-24 min-w-[400px]">
        {/* Now line */}
        {nowPct > 0 && nowPct < 100 && (
          <div
            className="absolute top-0 bottom-0 z-10 w-px"
            style={{ left: `${nowPct}%`, backgroundColor: "var(--primary)" }}
          >
            <div
              className="absolute -top-1 -translate-x-1/2 h-2 w-2 rounded-full"
              style={{ backgroundColor: "var(--primary)" }}
            />
          </div>
        )}

        {schedules.length === 0 && (
          <div className="flex h-full items-center justify-center font-mono text-[10px] text-muted-foreground/40">
            NO SCHEDULES TODAY
          </div>
        )}

        {schedules.map((s, i) => {
          const start = new Date(s.startAt);
          const end = new Date(s.endAt);
          const todayStartMs = todayStart.getTime();
          const leftPct = Math.max(
            0,
            ((start.getTime() - todayStartMs) / TIMELINE_DURATION_MS) * 100
          );
          const widthPct = Math.max(
            2,
            ((end.getTime() - start.getTime()) / TIMELINE_DURATION_MS) * 100
          );
          if (leftPct > 100) return null;

          const color = statusTimelineColor[s.status as ScheduleStatus] ?? "var(--muted-foreground)";
          const topPct = (i % 3) * 33;

          const isInProgress = s.status === "IN_PROGRESS";
          const progressPct = isInProgress
            ? Math.min(100, Math.max(0,
                (Date.now() - new Date(s.startAt).getTime()) /
                (new Date(s.endAt).getTime() - new Date(s.startAt).getTime()) * 100
              ))
            : 0;

          return (
            <div
              key={s.id}
              className="absolute rounded-[2px] px-1 overflow-hidden flex flex-col justify-start"
              style={{
                left: `${leftPct}%`,
                width: `${Math.min(widthPct, 100 - leftPct)}%`,
                top: `${topPct}%`,
                height: "30%",
                backgroundColor: `${color}22`,
                borderLeft: `2px solid ${color}`,
              }}
              title={`${s.job?.name ?? s.jobId} — ${s.pilot?.name ?? "—"}`}
            >
              <span className="font-mono text-[9px] truncate" style={{ color }}>
                {new Date(s.startAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: UAE_TZ,
                  hour12: false,
                })}
              </span>
              <span className="text-[9px] truncate text-foreground/70">
                {s.job?.name ?? s.jobId}
              </span>
              {isInProgress && (
                <div
                  className="absolute bottom-0 left-0 h-px"
                  style={{ width: `${progressPct}%`, backgroundColor: "var(--primary)" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Fleet Status Column ---------- */

const droneStatusVariant: Record<DroneStatus, "live" | "warn" | "down"> = {
  AVAILABLE:      "live",
  MAINTENANCE:    "warn",
  OUT_OF_SERVICE: "down",
};

function FleetStatusList() {
  const { data, isLoading } = useDrones({ pageSize: 20 });
  const drones = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded-[3px] bg-muted" />
        ))}
      </div>
    );
  }

  if (drones.length === 0) {
    return (
      <p className="py-4 text-center font-mono text-[10px] text-muted-foreground">
        NO DRONES
      </p>
    );
  }

  return (
    <div className="divide-y divide-border/40">
      {drones.map((d) => (
        <Link
          key={d.id}
          to="/dashboard/drones/$droneId"
          params={{ droneId: d.id }}
          className="flex items-center gap-2 py-2 hover:bg-muted/20 px-1 rounded-[3px] transition-colors"
        >
          <StatusDot variant={droneStatusVariant[d.status as DroneStatus] ?? "idle"} />
          <span className="font-mono text-[11px] text-muted-foreground flex-1 min-w-0 truncate">
            {d.serialNumber}
          </span>
          <span className="text-xs text-foreground truncate max-w-[80px]">{d.name}</span>
          <DroneStatusBadge status={d.status} label={DRONE_STATUS_LABELS[d.status as DroneStatus] ?? d.status} />
        </Link>
      ))}
    </div>
  );
}

/* ---------- Quick Actions ---------- */

const quickActions = [
  { label: "New Site",     to: "/dashboard/sites/new"     as const },
  { label: "New Job",      to: "/dashboard/jobs/new"      as const },
  { label: "New Schedule", to: "/dashboard/schedules/new" as const },
  { label: "New Drone",    to: "/dashboard/drones/new"    as const },
];

/* ---------- Main ---------- */

function DashboardIndex() {
  const { data: user } = useUser();
  const { data: stats } = useStatisticsOverview();
  const { data: jobStats } = useJobStats();

  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const auhDate = useMemo(() => getAUHDate(), []);

  const scheduleSegments: Segment[] = [
    { label: "Assigned",    value: stats?.schedulesByStatus?.ASSIGNED    ?? 0, color: "var(--primary)" },
    { label: "In Progress", value: stats?.schedulesByStatus?.IN_PROGRESS ?? 0, color: "var(--teal)" },
    { label: "Completed",   value: stats?.schedulesByStatus?.COMPLETED   ?? 0, color: "var(--success)" },
    { label: "Cancelled",   value: stats?.schedulesByStatus?.CANCELLED   ?? 0, color: "var(--muted-foreground)" },
  ];

  const jobSegments: Segment[] = [
    { label: "Inspection", value: jobStats?.byType?.INSPECTION ?? 0, color: "var(--chart-3)" },
    { label: "Cleaning",   value: jobStats?.byType?.CLEANING   ?? 0, color: "var(--teal)" },
  ];

  return (
    <div className="dashboard-grid-bg space-y-6">
      {/* Welcome line */}
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-display font-bold">
          {getGreeting(firstName)}
        </h1>
        <span className="font-mono text-[11px] text-muted-foreground shrink-0">{auhDate}</span>
      </div>

      {/* Fleet snapshot — full width */}
      <FleetSnapshot />

      {/* Three-column ops grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Live ops feed — 4 cols */}
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2 pt-4 px-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Live Ops Feed
            </p>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <LiveOpsFeed />
          </CardContent>
        </Card>

        {/* Today's timeline — 5 cols */}
        <Card className="lg:col-span-5">
          <CardHeader className="pb-2 pt-4 px-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Today's Timeline
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <TodayTimeline />
          </CardContent>
        </Card>

        {/* Fleet status — 3 cols */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2 pt-4 px-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Fleet Status
            </p>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <FleetStatusList />
          </CardContent>
        </Card>
      </div>

      {/* Segmented bars row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Schedules by Status
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <SegmentedBar segments={scheduleSegments} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Jobs by Type
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <SegmentedBar segments={jobSegments} />
          </CardContent>
        </Card>
      </div>

      {/* Weather calendar */}
      <WeeklyWeatherCalendar />

      {/* Quick actions */}
      <div className="flex flex-wrap items-center gap-2">
        {quickActions.map((action) => (
          <Link key={action.to} to={action.to}>
            <Button variant="ghost" size="sm" className="gap-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-primary">
              <span className="text-primary font-bold">+</span>
              {action.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
