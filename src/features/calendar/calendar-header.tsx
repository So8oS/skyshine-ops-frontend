import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPeriodTitle, nextPeriod, prevPeriod } from "./helpers";
import type { CalendarView } from "@/routes/dashboard/schedules";

const VIEW_LABELS: Record<CalendarView, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
};

interface CalendarHeaderProps {
  date: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
  className?: string;
}

export function CalendarHeader({
  date,
  view,
  onViewChange,
  onDateChange,
  className,
}: CalendarHeaderProps) {
  const title = getPeriodTitle(date, view);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border bg-muted/30 p-1">
          {(Object.keys(VIEW_LABELS) as CalendarView[]).map((v) => (
            <Button
              key={v}
              variant={view === v ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-3"
              onClick={() => onViewChange(v)}
            >
              {VIEW_LABELS[v]}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => onDateChange(new Date())}
        >
          Today
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDateChange(prevPeriod(date, view))}
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-[200px] sm:min-w-[280px] text-center">
          <p className="text-sm font-medium flex items-center justify-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            {title}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDateChange(nextPeriod(date, view))}
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
