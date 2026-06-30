"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimePickerInput, PeriodSelector, type Period } from "@/components/ui/time-picker";

function parseValue(value: string): Date | undefined {
  if (!value || value.trim() === "") return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export interface DateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function DateTimePicker({
  value = "",
  onChange,
  label,
  id,
  disabled,
  className,
  error,
}: DateTimePickerProps) {
  const [date, setDateState] = React.useState<Date | undefined>(() => parseValue(value));
  const [period, setPeriod] = React.useState<Period>(() => {
    const d = parseValue(value);
    return d && d.getHours() >= 12 ? "PM" : "AM";
  });

  const hourRef = React.useRef<HTMLInputElement>(null);
  const minuteRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const d = parseValue(value);
    setDateState(d);
    if (d) setPeriod(d.getHours() >= 12 ? "PM" : "AM");
  }, [value]);

  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) return;
    const newDate = new Date(selected);
    if (date) {
      newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
    } else {
      newDate.setHours(0, 0, 0, 0);
    }
    setDateState(newDate);
    onChange(toDateTimeLocal(newDate));
  };

  const handleTimeChange = (newDate: Date) => {
    setDateState(newDate);
    onChange(toDateTimeLocal(newDate));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className="block">
          {label}
        </Label>
      )}
      <Card className="w-fit overflow-hidden">
        <CardContent className="p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={disabled}
            className="rounded-lg border-0"
          />
        </CardContent>
        <CardFooter className="border-t bg-muted/30 flex items-center gap-2 py-3 px-4">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-1">
            <TimePickerInput
              ref={hourRef}
              picker="hours"
              period={period}
              date={date}
              setDate={handleTimeChange}
              disabled={disabled}
              onRightFocus={() => minuteRef.current?.focus()}
            />
            <span className="text-muted-foreground font-mono text-sm select-none">:</span>
            <TimePickerInput
              ref={minuteRef}
              picker="minutes"
              date={date}
              setDate={handleTimeChange}
              disabled={disabled}
              onLeftFocus={() => hourRef.current?.focus()}
              onRightFocus={() => { /* period via click */ }}
            />
          </div>
          <PeriodSelector
            period={period}
            date={date}
            setDate={(newDate) => {
              const h = newDate.getHours();
              setPeriod(h >= 12 ? "PM" : "AM");
              handleTimeChange(newDate);
            }}
            onLeftFocus={() => minuteRef.current?.focus()}
            disabled={disabled}
          />
        </CardFooter>
      </Card>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
