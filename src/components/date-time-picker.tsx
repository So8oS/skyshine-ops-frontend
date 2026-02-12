"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/** Parse value to Date (or undefined if empty) and time string HH:mm */
function parseValue(value: string): { date: Date | undefined; time: string } {
  if (!value || value.trim() === "") {
    return { date: undefined, time: "" };
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: undefined, time: "" };
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: d,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/** Build datetime-local string (YYYY-MM-DDTHH:mm) from date + time */
function toDateTimeLocal(date: Date, time: string): string {
  const parts = time.split(":").map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
  const parsed = React.useMemo(() => parseValue(value), [value]);
  const [date, setDate] = React.useState<Date | undefined>(parsed.date);
  const [time, setTime] = React.useState(parsed.time);

  React.useEffect(() => {
    const p = parseValue(value);
    setDate(p.date);
    setTime(p.time);
  }, [value]);

  const handleDateSelect = (d: Date | undefined) => {
    setDate(d);
    if (d) {
      const timeVal = time || "00:00";
      setTime(timeVal);
      onChange(toDateTimeLocal(d, timeVal));
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value;
    setTime(t);
    const d = date ?? new Date();
    if (t) onChange(toDateTimeLocal(d, t));
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
        <CardFooter className="border-t bg-muted/30 flex flex-col gap-2 py-3">
          <div className="flex items-center gap-2 w-full">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              id={id}
              type="time"
              value={time}
              onChange={handleTimeChange}
              disabled={disabled}
              className="flex-1 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full cursor-pointer"
            />
          </div>
        </CardFooter>
      </Card>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
