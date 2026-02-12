import { useState, useMemo, useCallback } from "react";
import type { Schedule } from "@/actions/schedules";
import { getViewRange } from "./helpers";
import type { CalendarView } from "@/routes/dashboard/schedules";
import { CalendarHeader } from "./calendar-header";
import { DayView, WeekView, MonthView } from "./views";
import { cn } from "@/lib/utils";

interface ScheduleCalendarProps {
  schedules: Schedule[];
  /** Optional initial date (default: today) */
  initialDate?: Date;
  /** Optional initial view */
  initialView?: CalendarView;
  /** Controlled date (when set, calendar is controlled) */
  date?: Date;
  /** Controlled view */
  view?: CalendarView;
  /** Called when date changes (use with date for controlled mode) */
  onDateChange?: (date: Date) => void;
  /** Called when view changes */
  onViewChange?: (view: CalendarView) => void;
  className?: string;
}

export function ScheduleCalendar({
  schedules,
  initialDate = new Date(),
  initialView = "week",
  date: controlledDate,
  view: controlledView,
  onDateChange,
  onViewChange,
  className,
}: ScheduleCalendarProps) {
  const [internalDate, setInternalDate] = useState(initialDate);
  const [internalView, setInternalView] = useState<CalendarView>(initialView);

  const isControlled = controlledDate !== undefined && controlledView !== undefined;
  const date = isControlled ? controlledDate! : internalDate;
  const view = isControlled ? controlledView! : internalView;

  const setDate = useCallback(
    (d: Date) => {
      if (!isControlled) setInternalDate(d);
      onDateChange?.(d);
    },
    [isControlled, onDateChange]
  );
  const setView = useCallback(
    (v: CalendarView) => {
      if (!isControlled) setInternalView(v);
      onViewChange?.(v);
    },
    [isControlled, onViewChange]
  );

  const { start, end } = useMemo(() => getViewRange(date, view), [date, view]);

  const visibleSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const sStart = new Date(s.startAt);
      const sEnd = new Date(s.endAt);
      return sStart <= end && sEnd >= start;
    });
  }, [schedules, start, end]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <CalendarHeader
        date={date}
        view={view}
        onViewChange={setView}
        onDateChange={setDate}
      />
      {view === "day" && (
        <DayView date={date} schedules={visibleSchedules} />
      )}
      {view === "week" && (
        <WeekView date={date} schedules={visibleSchedules} />
      )}
      {view === "month" && (
        <MonthView date={date} schedules={visibleSchedules} />
      )}
    </div>
  );
}
