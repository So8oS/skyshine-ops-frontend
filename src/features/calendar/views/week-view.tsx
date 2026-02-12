import { format, startOfDay, isSameDay } from "date-fns";
import { Link } from "@tanstack/react-router";
import type { Schedule } from "@/actions/schedules";
import { cn } from "@/lib/utils";
import { getWeekDays, rangesOverlap, dayPercentage } from "../helpers";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const ROW_HEIGHT = 56;
const WEEK_STARTS_ON = 1; // Monday

interface WeekViewProps {
  date: Date;
  schedules: Schedule[];
  className?: string;
}

export function WeekView({ date, schedules, className }: WeekViewProps) {
  const days = getWeekDays(date, WEEK_STARTS_ON);

  const getSchedulesForDay = (dayStart: Date) => {
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    return schedules.filter((s) => {
      const start = new Date(s.startAt);
      const end = new Date(s.endAt);
      return rangesOverlap(dayStart, dayEnd, start, end);
    });
  };

  const totalHeight = HOURS.length * ROW_HEIGHT;

  return (
    <div className={cn("flex flex-col border rounded-lg overflow-hidden bg-card", className)}>
      <div
        className="grid border-b bg-muted/50 text-sm"
        style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` }}
      >
        <div className="p-2 text-xs font-medium text-muted-foreground" />
        {days.map((d) => (
          <div key={d.toISOString()} className="p-2 text-center font-medium">
            <div>{format(d, "EEE")}</div>
            <div className="text-muted-foreground text-xs">{format(d, "d")}</div>
          </div>
        ))}
      </div>
      <div className="overflow-auto" style={{ minHeight: 400 }}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))`,
            height: totalHeight,
            minHeight: totalHeight,
          }}
        >
          <div className="flex flex-col border-r border-muted/50">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="text-xs text-muted-foreground pl-1 pt-0.5 border-b border-dashed border-muted"
                style={{ height: ROW_HEIGHT }}
              >
                {format(new Date(2000, 0, 1, hour), "h a")}
              </div>
            ))}
          </div>
          {days.map((day) => {
            const dayStart = startOfDay(day);
            const daySchedules = getSchedulesForDay(dayStart);

            return (
              <div
                key={day.toISOString()}
                className="relative border-l border-muted/50"
                style={{ height: totalHeight }}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-b border-dashed border-muted/50"
                    style={{
                      top: hour * ROW_HEIGHT,
                      height: ROW_HEIGHT,
                    }}
                  />
                ))}
                {daySchedules.map((schedule) => {
                  const start = new Date(schedule.startAt);
                  const end = new Date(schedule.endAt);
                  const isFirstDay = isSameDay(start, day);
                  const dayDuration = 24 * 60;
                  const startMinutes = isFirstDay ? dayPercentage(start) * dayDuration : 0;
                  const endMinutes = isSameDay(end, day)
                    ? dayPercentage(end) * dayDuration
                    : dayDuration;
                  const duration = endMinutes - startMinutes;
                  const topPct = (startMinutes / dayDuration) * 100;
                  const heightPct = (duration / dayDuration) * 100;

                  return (
                    <Link
                      key={schedule.id}
                      to="/dashboard/schedules/$scheduleId"
                      params={{ scheduleId: schedule.id }}
                      className="absolute left-0.5 right-0.5 rounded border bg-primary/10 hover:bg-primary/20 text-primary-foreground overflow-hidden block"
                      style={{
                        top: `${topPct}%`,
                        height: `${Math.max(heightPct, 3)}%`,
                        minHeight: 22,
                      }}
                    >
                      <div className="p-0.5 text-[10px] truncate font-medium">
                        {schedule.job?.name ?? schedule.jobId}
                      </div>
                      <div className="px-0.5 pb-0.5 text-[10px] text-muted-foreground truncate">
                        {format(start, "h:mm a")}
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
