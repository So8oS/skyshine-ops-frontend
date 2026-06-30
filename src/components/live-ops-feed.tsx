import { useMemo } from "react";
import { useSchedules, SCHEDULE_STATUS_LABELS, type ScheduleStatus } from "@/actions/schedules";
import { ScheduleStatusBadge } from "./status-badge";
import { StatusDot } from "./status-dot";
import { Link } from "@tanstack/react-router";

const statusToVariant: Record<ScheduleStatus, "live" | "warn" | "ok" | "idle" | "down"> = {
  IN_PROGRESS: "live",
  ASSIGNED:    "warn",
  COMPLETED:   "ok",
  CANCELLED:   "idle",
};

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function LiveOpsFeed() {
  const now = useMemo(() => new Date(), []);

  const from = useMemo(() => {
    const d = new Date(now);
    d.setHours(d.getHours() - 6);
    return d.toISOString();
  }, [now]);

  const to = useMemo(() => {
    const d = new Date(now);
    d.setHours(d.getHours() + 6);
    return d.toISOString();
  }, [now]);

  const { data, isLoading } = useSchedules(
    { from, to, pageSize: 50 },
    { refetchInterval: 30_000 } as Parameters<typeof useSchedules>[1]
  );

  const schedules = useMemo(() => {
    const items = data?.items ?? [];
    return [...items].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    ).slice(0, 12);
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-[3px] bg-muted" />
        ))}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <p className="py-4 text-center font-mono text-xs text-muted-foreground">
        NO OPS IN WINDOW
      </p>
    );
  }

  return (
    <div className="space-y-0 divide-y divide-border/50 overflow-y-auto max-h-[340px]">
      {schedules.map((s) => {
        const variant = statusToVariant[s.status as ScheduleStatus] ?? "idle";
        const siteName = s.job?.site?.name ?? "—";
        const jobName = s.job?.name ?? s.jobId;
        const pilotName = s.pilot?.name ?? "—";
        const droneName = s.drone?.name ?? "—";
        const label = SCHEDULE_STATUS_LABELS[s.status as ScheduleStatus] ?? s.status;

        return (
          <Link
            key={s.id}
            to="/dashboard/schedules/$scheduleId"
            params={{ scheduleId: s.id }}
            className="flex flex-col gap-0.5 px-2 py-2 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <StatusDot variant={variant} pulse={s.status === "IN_PROGRESS"} />
              <span className="font-mono text-[11px] text-muted-foreground w-10 shrink-0">
                {formatTime(s.startAt)}
              </span>
              <span className="flex-1 truncate text-xs font-medium text-foreground">
                {siteName !== "—" ? `${siteName} — ` : ""}{jobName}
              </span>
              <ScheduleStatusBadge status={s.status} label={label} />
            </div>
            <div className="pl-[1.375rem] font-mono text-[10px] text-muted-foreground">
              ↳ {pilotName} · {droneName}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
