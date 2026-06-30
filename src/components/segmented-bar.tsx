import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Segment {
  label: string;
  value: number;
  color: string;
}

interface SegmentedBarProps {
  segments: Segment[];
  className?: string;
}

export function SegmentedBar({ segments, className }: SegmentedBarProps) {
  const [tooltip, setTooltip] = useState<{
    label: string;
    value: number;
    total: number;
    x: number;
    y: number;
  } | null>(null);

  const total = segments.reduce((s, seg) => s + seg.value, 0);

  if (total === 0) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="h-2 w-full rounded-sm bg-muted" />
        <p className="text-xs text-muted-foreground">No data</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Bar */}
      <div className="relative flex h-2 w-full gap-[2px] overflow-hidden rounded-[3px]">
        {segments
          .filter((s) => s.value > 0)
          .map((seg) => {
            const pct = (seg.value / total) * 100;
            return (
              <div
                key={seg.label}
                title={`${seg.label}: ${seg.value}`}
                style={{ width: `${pct}%`, backgroundColor: seg.color }}
                className="h-full cursor-pointer transition-opacity hover:opacity-80"
                onMouseEnter={(e) => {
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  setTooltip({
                    label: seg.label,
                    value: seg.value,
                    total,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
      </div>

      {/* Tooltip (portal-free, absolute) */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-[3px] border border-border bg-popover px-2 py-1 font-mono text-[10px] text-foreground shadow-none"
          style={{ left: tooltip.x, top: tooltip.y - 6 }}
        >
          {tooltip.label}: {tooltip.value} of {tooltip.total} (
          {Math.round((tooltip.value / tooltip.total) * 100)}%)
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-muted-foreground">{seg.label}</span>
            <span className="font-mono text-xs text-foreground">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
