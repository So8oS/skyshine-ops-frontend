import { format, startOfDay } from "date-fns";
import { Link } from "@tanstack/react-router";
import type { Schedule } from "@/actions/schedules";
import { SCHEDULE_STATUS_LABELS } from "@/actions/schedules";
import { cn } from "@/lib/utils";
import { rangesOverlap, dayPercentage, durationMinutes } from "../helpers";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface DayViewProps {
  date: Date;
  schedules: Schedule[];
  className?: string;
}

export function DayView({ date, schedules, className }: DayViewProps) {
  const dayStart = startOfDay(date);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  const visible = schedules.filter((s) => {
    const start = new Date(s.startAt);
    const end = new Date(s.endAt);
    return rangesOverlap(dayStart, dayEnd, start, end);
  });

  return (
    <div className={cn("flex flex-col border rounded-lg overflow-hidden bg-card", className)}>
      <div className="grid grid-cols-[56px_1fr] border-b bg-muted/50">
        <div className="p-2 text-xs font-medium text-muted-foreground" />
        <div className="p-2 text-sm font-medium">
          {format(date, "EEEE, MMM d")}
        </div>
      </div>
      <div className="flex overflow-auto min-h-[600px]">
        <div className="flex flex-col shrink-0">
          {HOURS.map((h) => (
            <div
              key={h}
              className="h-14 border-b text-xs text-muted-foreground pl-1 pt-0.5"
              style={{ minHeight: 56 }}
            >
              {format(new Date(2000, 0, 1, h), "h a")}
            </div>
          ))}
        </div>
        <div className="flex-1 relative" style={{ minWidth: 200 }}>
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute left-0 right-0 border-b border-dashed border-muted"
              style={{
                top: `${(h / 24) * 100}%`,
                height: `${(1 / 24) * 100}%`,
                minHeight: 56,
              }}
            />
          ))}
          {visible.map((schedule) => {
            const start = new Date(schedule.startAt);
            const end = new Date(schedule.endAt);
            const top = dayPercentage(start) * 100;
            const dayDuration = 24 * 60;
            const duration = durationMinutes(start, end);
            const heightPct = Math.min((duration / dayDuration) * 100, 100 - top);

            return (
              <Link
                key={schedule.id}
                to="/dashboard/schedules/$scheduleId"
                params={{ scheduleId: schedule.id }}
                className="absolute left-1 right-1 rounded-md border bg-primary/10 hover:bg-primary/20 text-primary-foreground overflow-hidden"
                style={{
                  top: `${top}%`,
                  height: `${Math.max(heightPct, 4)}%`,
                  minHeight: 28,
                }}
              >
                <div className="p-1.5 text-xs truncate">
                  <span className="font-medium">{schedule.job?.name ?? schedule.jobId}</span>
                  <span className="text-muted-foreground ml-1">
                    {SCHEDULE_STATUS_LABELS[schedule.status]}
                  </span>
                </div>
                <div className="px-1.5 pb-1 text-[11px] text-muted-foreground truncate">
                  {schedule.pilot?.name ?? schedule.pilotId} · {schedule.drone?.name ?? schedule.droneId}
                </div>
                <div className="px-1.5 pb-1 text-[11px] text-muted-foreground">
                  {format(start, "h:mm a")} – {format(end, "h:mm a")}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
