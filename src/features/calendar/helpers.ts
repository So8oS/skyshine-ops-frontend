import {
  addDays,
  endOfDay,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  addMonths,
  addWeeks,
  subWeeks,
  endOfMonth,
  eachDayOfInterval,
  differenceInMinutes,
  type Locale,
} from "date-fns";
import type { CalendarView } from "@/routes/dashboard/schedules";

/** Get the date range (start, end) for the given view and focal date */
export function getViewRange(
  date: Date,
  view: CalendarView,
  weekStartsOn: 0 | 1 = 1
): { start: Date; end: Date } {
  switch (view) {
    case "day": {
      const start = startOfDay(date);
      const end = endOfDay(date);
      return { start, end };
    }
    case "week": {
      const start = startOfWeek(date, { weekStartsOn });
      const end = endOfWeek(date, { weekStartsOn });
      return { start, end };
    }
    case "month": {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      return { start, end };
    }
  }
}

/** Navigate to previous period for the given view */
export function prevPeriod(date: Date, view: CalendarView): Date {
  switch (view) {
    case "day":
      return subDays(date, 1);
    case "week":
      return subWeeks(date, 1);
    case "month":
      return subMonths(date, 1);
  }
}

/** Navigate to next period for the given view */
export function nextPeriod(date: Date, view: CalendarView): Date {
  switch (view) {
    case "day":
      return addDays(date, 1);
    case "week":
      return addWeeks(date, 1);
    case "month":
      return addMonths(date, 1);
  }
}

/** Human-readable title for the current period */
export function getPeriodTitle(
  date: Date,
  view: CalendarView,
  weekStartsOn: 0 | 1 = 1,
  locale?: Locale
): string {
  switch (view) {
    case "day":
      return format(date, "EEEE, MMM d, yyyy", { locale });
    case "week": {
      const start = startOfWeek(date, { weekStartsOn });
      const end = endOfWeek(date, { weekStartsOn });
      if (start.getMonth() === end.getMonth()) {
        return format(start, "MMMM yyyy", { locale }) + ` (${format(start, "d", { locale })} – ${format(end, "d", { locale })})`;
      }
      return `${format(start, "MMM d", { locale })} – ${format(end, "MMM d, yyyy", { locale })}`;
    }
    case "month":
      return format(date, "MMMM yyyy", { locale });
  }
}

/** All days to show in month view (including leading/trailing from adjacent months) */
export function getMonthCalendarDays(
  date: Date,
  weekStartsOn: 0 | 1 = 1
): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const startWeek = startOfWeek(start, { weekStartsOn });
  const endWeek = endOfWeek(end, { weekStartsOn });
  return eachDayOfInterval({ start: startWeek, end: endWeek });
}

/** All days in the week for week view */
export function getWeekDays(date: Date, weekStartsOn: 0 | 1 = 1): Date[] {
  const start = startOfWeek(date, { weekStartsOn });
  return eachDayOfInterval({
    start,
    end: addDays(start, 6),
  });
}

/** Minutes from start of day (0–24*60) */
export function minutesFromMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/** Percentage of day (0–1) for a given time */
export function dayPercentage(d: Date): number {
  const total = 24 * 60;
  return minutesFromMidnight(d) / total;
}

/** Duration in minutes between two dates */
export function durationMinutes(start: Date, end: Date): number {
  return differenceInMinutes(end, start);
}

/** Check if two date ranges overlap */
export function rangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}
