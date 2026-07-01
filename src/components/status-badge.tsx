import { cn } from "@/lib/utils";

function Badge({
  label,
  className,
  pulse,
}: {
  label: string;
  className: string;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 text-mono text-[10px] uppercase tracking-widest border rounded-[3px]",
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 bg-current" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {label}
    </span>
  );
}

const scheduleStatusClass: Record<string, string> = {
  ASSIGNED:    "bg-primary/10 text-primary border-primary/30",
  IN_PROGRESS: "bg-teal/10 text-teal border-teal/30",
  COMPLETED:   "bg-success/10 text-success border-success/30",
  CANCELLED:   "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
};

const droneStatusClass: Record<string, string> = {
  AVAILABLE:      "bg-success/10 text-success border-success/30",
  MAINTENANCE:    "bg-warning/10 text-warning border-warning/30",
  OUT_OF_SERVICE: "bg-destructive/10 text-destructive border-destructive/30",
};

const jobTypeClass: Record<string, string> = {
  INSPECTION: "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/30",
  CLEANING:   "bg-teal/10 text-teal border-teal/30",
};

const feedKindClass: Record<string, string> = {
  SCHEDULE_UPDATED:     "bg-primary/10 text-primary border-primary/30",
  SCHEDULE_CREATED:     "bg-teal/10 text-teal border-teal/30",
  SITE_CREATED:         "bg-teal/10 text-teal border-teal/30",
  JOB_CREATED:          "bg-teal/10 text-teal border-teal/30",
  DRONE_CREATED:        "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
  DRONE_STATUS_CHANGED: "bg-primary/10 text-primary border-primary/30",
};

const fallbackClass = "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20";

export function ScheduleStatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <Badge
      label={label}
      className={scheduleStatusClass[status] ?? fallbackClass}
      pulse={status === "IN_PROGRESS"}
    />
  );
}

export function DroneStatusBadge({ status, label }: { status: string; label: string }) {
  return <Badge label={label} className={droneStatusClass[status] ?? fallbackClass} />;
}

export function JobTypeBadge({ type, label }: { type: string; label: string }) {
  return <Badge label={label} className={jobTypeClass[type] ?? fallbackClass} />;
}

export function FeedKindBadge({ kind, label }: { kind: string; label: string }) {
  return <Badge label={label} className={feedKindClass[kind] ?? fallbackClass} />;
}
