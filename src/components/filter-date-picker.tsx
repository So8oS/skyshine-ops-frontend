import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePickerInput, PeriodSelector, type Period } from "@/components/ui/time-picker";

interface FilterDatePickerProps {
  label: string;
  value: string; // ISO string or ""
  onChange: (iso: string | undefined) => void;
  className?: string;
}

function parseIso(iso: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? undefined : d;
}

function formatDisplay(d: Date): string {
  return format(d, "MMM d, h:mm a");
}

export function FilterDatePicker({ label, value, onChange, className }: FilterDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(() => parseIso(value));
  const [period, setPeriod] = React.useState<Period>(() => {
    const d = parseIso(value);
    return d && d.getHours() >= 12 ? "PM" : "AM";
  });

  const hourRef = React.useRef<HTMLInputElement>(null);
  const minuteRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const d = parseIso(value);
    setDate(d);
    if (d) setPeriod(d.getHours() >= 12 ? "PM" : "AM");
  }, [value]);

  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) return;
    const next = new Date(selected);
    if (date) {
      next.setHours(date.getHours(), date.getMinutes(), 0, 0);
    } else {
      next.setHours(0, 0, 0, 0);
    }
    setDate(next);
    onChange(next.toISOString());
  };

  const handleTimeChange = (next: Date) => {
    setDate(next);
    onChange(next.toISOString());
  };

  const handlePeriodChange = (next: Date) => {
    setPeriod(next.getHours() >= 12 ? "PM" : "AM");
    handleTimeChange(next);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(undefined);
    onChange(undefined);
    setOpen(false);
  };

  const hasValue = !!date;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "group inline-flex items-center gap-1.5 rounded-md border px-3 h-9 text-sm transition-all",
            hasValue
              ? "border-primary/40 bg-primary/5 text-foreground"
              : "border-input bg-background/50 text-muted-foreground hover:border-border hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
        >
          <CalendarIcon
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-colors",
              hasValue ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )}
          />
          <span className="truncate max-w-[130px]">
            {hasValue ? formatDisplay(date!) : label}
          </span>
          {hasValue && (
            <span
              role="button"
              onClick={handleClear}
              className="ml-0.5 rounded-sm p-0.5 opacity-60 hover:opacity-100 hover:bg-muted transition-all"
              aria-label="Clear"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-auto" align="start">
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="border-0"
          />

          {/* Time row */}
          <div className="border-t px-3 py-2.5 flex items-center gap-2">
            <div className="flex items-center gap-1 flex-1">
              <TimePickerInput
                ref={hourRef}
                picker="hours"
                period={period}
                date={date}
                setDate={handleTimeChange}
                onRightFocus={() => minuteRef.current?.focus()}
              />
              <span className="text-muted-foreground font-mono text-sm select-none">:</span>
              <TimePickerInput
                ref={minuteRef}
                picker="minutes"
                date={date}
                setDate={handleTimeChange}
                onLeftFocus={() => hourRef.current?.focus()}
              />
              <PeriodSelector
                period={period}
                date={date}
                setDate={handlePeriodChange}
                onLeftFocus={() => minuteRef.current?.focus()}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
