import * as React from "react";
import { cn } from "@/lib/utils";

export type Period = "AM" | "PM";

function to12Hour(hours: number): string {
  const h = hours % 12;
  return String(h === 0 ? 12 : h).padStart(2, "0");
}

function applyHour12(date: Date, h12: number, period: Period): void {
  if (period === "PM") {
    date.setHours(h12 === 12 ? 12 : h12 + 12);
  } else {
    date.setHours(h12 === 12 ? 0 : h12);
  }
}

interface TimePickerInputProps {
  picker: "hours" | "minutes";
  date: Date | undefined;
  setDate: (date: Date) => void;
  period?: Period;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
  disabled?: boolean;
}

export const TimePickerInput = React.forwardRef<HTMLInputElement, TimePickerInputProps>(
  function TimePickerInput(
    { picker, date, setDate, period, onRightFocus, onLeftFocus, disabled },
    ref
  ) {
    const [flag, setFlag] = React.useState(false);
    const [firstDigit, setFirstDigit] = React.useState<number | null>(null);
    const [displayValue, setDisplayValue] = React.useState("00");

    React.useEffect(() => {
      if (flag) return;
      if (!date) { setDisplayValue("00"); return; }
      if (picker === "hours") {
        setDisplayValue(period ? to12Hour(date.getHours()) : String(date.getHours()).padStart(2, "0"));
      } else {
        setDisplayValue(String(date.getMinutes()).padStart(2, "0"));
      }
    }, [date, picker, period, flag]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Tab") return;
      if (e.key === "ArrowRight") { e.preventDefault(); onRightFocus?.(); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); onLeftFocus?.(); return; }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        setFlag(false);
        setFirstDigit(null);
        const step = e.key === "ArrowUp" ? 1 : -1;
        const newDate = new Date(date ?? new Date());
        if (picker === "hours") {
          if (period) {
            const h = newDate.getHours() % 12 || 12;
            const newH12 = ((h - 1 + step + 12) % 12) + 1;
            applyHour12(newDate, newH12, period);
          } else {
            newDate.setHours((newDate.getHours() + step + 24) % 24);
          }
        } else {
          newDate.setMinutes((newDate.getMinutes() + step + 60) % 60);
        }
        setDate(newDate);
        return;
      }

      if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }

      const digit = parseInt(e.key, 10);
      // max first digit: hours12 → 1, hours24 → 2, minutes → 5
      const maxFirst = picker === "hours" ? (period ? 1 : 2) : 5;

      if (!flag) {
        setDisplayValue(String(digit).padStart(2, "0"));

        if (digit > maxFirst) {
          // single digit is complete
          const newDate = new Date(date ?? new Date());
          if (picker === "hours") {
            if (period) applyHour12(newDate, Math.min(Math.max(digit, 1), 12), period);
            else newDate.setHours(Math.min(digit, 23));
          } else {
            newDate.setMinutes(Math.min(digit, 59));
          }
          setDate(newDate);
          setFirstDigit(null);
          onRightFocus?.();
        } else {
          setFirstDigit(digit);
          setFlag(true);
        }
      } else {
        setFlag(false);
        const fd = firstDigit ?? 0;
        const twoDigit = fd * 10 + digit;
        const newDate = new Date(date ?? new Date());

        if (picker === "hours") {
          if (period) applyHour12(newDate, Math.min(Math.max(twoDigit, 1), 12), period);
          else newDate.setHours(Math.min(twoDigit, 23));
        } else {
          newDate.setMinutes(Math.min(twoDigit, 59));
        }
        setDate(newDate);
        setFirstDigit(null);
        onRightFocus?.();
      }
    };

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        onFocus={(e) => e.target.select()}
        onBlur={() => { setFlag(false); setFirstDigit(null); }}
        disabled={disabled}
        className={cn(
          "w-10 text-center text-sm font-mono tabular-nums caret-transparent",
          "h-9 rounded-md border border-input bg-background/50 py-1",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "selection:bg-primary/30"
        )}
      />
    );
  }
);

interface PeriodSelectorProps {
  period: Period;
  date: Date | undefined;
  setDate: (date: Date) => void;
  onLeftFocus?: () => void;
  disabled?: boolean;
}

export function PeriodSelector({ period, date, setDate, onLeftFocus, disabled }: PeriodSelectorProps) {
  const toggle = (newPeriod: Period) => {
    if (newPeriod === period || !date) return;
    const newDate = new Date(date);
    const h = newDate.getHours();
    if (newPeriod === "PM" && h < 12) newDate.setHours(h + 12);
    if (newPeriod === "AM" && h >= 12) newDate.setHours(h - 12);
    setDate(newDate);
  };

  return (
    <div
      className="flex flex-col h-9 border border-input rounded-md overflow-hidden"
      role="group"
      aria-label="AM/PM"
    >
      {(["AM", "PM"] as Period[]).map((p) => (
        <button
          key={p}
          type="button"
          tabIndex={0}
          disabled={disabled}
          onClick={() => toggle(p)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              toggle(period === "AM" ? "PM" : "AM");
            }
            if (e.key === "ArrowLeft") { e.preventDefault(); onLeftFocus?.(); }
          }}
          className={cn(
            "flex-1 px-2 text-[11px] font-medium leading-none transition-colors select-none",
            period === p
              ? "bg-primary text-primary-foreground"
              : "bg-background/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
