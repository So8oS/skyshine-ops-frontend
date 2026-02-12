import { format, isSameMonth, isToday } from "date-fns";
import { Link } from "@tanstack/react-router";
import type { Schedule } from "@/actions/schedules";
import { cn } from "@/lib/utils";
import { getMonthCalendarDays } from "../helpers";

const WEEK_STARTS_ON = 1; // Monday
const DAYS_PER_ROW = 7;

interface MonthViewProps {
  date: Date;
  schedules: Schedule[];
  className?: string;
}

export function MonthView({ date, schedules, className }: MonthViewProps) {
  const days = getMonthCalendarDays(date, WEEK_STARTS_ON);

  const getSchedulesForDay = (d: Date) =>
    schedules.filter((s) => {
      const start = new Date(s.startAt);
      const end = new Date(s.endAt);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      return start <= dayEnd && end >= dayStart;
    });

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className={cn("flex flex-col border rounded-lg overflow-hidden bg-card", className)}>
      <div className="grid grid-cols-7 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
        {weekDays.map((label) => (
          <div key={label} className="p-2 text-center">
            {label}
          </div>
        ))}
      </div>
      <div
        className="grid flex-1 auto-rows-fr"
        style={{ gridTemplateColumns: `repeat(${DAYS_PER_ROW}, minmax(0, 1fr))`, minHeight: 400 }}
      >
        {days.map((d) => {
          const daySchedules = getSchedulesForDay(d);
          const inMonth = isSameMonth(d, date);

          return (
            <div
              key={d.toISOString()}
              className={cn(
                "min-h-[100px] border-b border-r border-muted/50 p-1.5 flex flex-col",
                !inMonth && "bg-muted/20 text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "text-xs font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                  isToday(d) && "bg-primary text-primary-foreground",
                  inMonth && !isToday(d) && "text-foreground"
                )}
              >
                {format(d, "d")}
              </div>
              <div className="flex-1 overflow-hidden space-y-0.5">
                {daySchedules.slice(0, 3).map((schedule) => (
                  <Link
                    key={schedule.id}
                    to="/dashboard/schedules/$scheduleId"
                    params={{ scheduleId: schedule.id }}
                    className="block rounded border bg-primary/10 hover:bg-primary/20 px-1.5 py-0.5 text-[11px] truncate"
                  >
                    <span className="font-medium">{schedule.job?.name ?? schedule.jobId}</span>
                    <span className="text-muted-foreground ml-1">
                      {format(new Date(schedule.startAt), "HH:mm")}
                    </span>
                  </Link>
                ))}
                {daySchedules.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">
                    +{daySchedules.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
