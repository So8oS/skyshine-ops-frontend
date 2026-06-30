import { cn } from "@/lib/utils";

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}

const scheduleStatusClass: Record<string, string> = {
  ASSIGNED:    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  COMPLETED:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED:   "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const droneStatusClass: Record<string, string> = {
  AVAILABLE:      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  MAINTENANCE:    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  OUT_OF_SERVICE: "bg-red-500/10 text-red-400 border-red-500/20",
};

const jobTypeClass: Record<string, string> = {
  INSPECTION: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  CLEANING:   "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

const fallbackClass = "bg-slate-500/10 text-slate-400 border-slate-500/20";

export function ScheduleStatusBadge({ status, label }: { status: string; label: string }) {
  return <Badge label={label} className={scheduleStatusClass[status] ?? fallbackClass} />;
}

export function DroneStatusBadge({ status, label }: { status: string; label: string }) {
  return <Badge label={label} className={droneStatusClass[status] ?? fallbackClass} />;
}

export function JobTypeBadge({ type, label }: { type: string; label: string }) {
  return <Badge label={label} className={jobTypeClass[type] ?? fallbackClass} />;
}
