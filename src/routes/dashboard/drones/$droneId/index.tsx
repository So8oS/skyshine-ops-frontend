import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import {
  useDrone,
  dronesApi,
  droneKeys,
  DRONE_STATUS_LABELS,
  type DroneStatus,
} from "@/actions/drones";
import { SCHEDULE_STATUS_LABELS, type ScheduleStatus } from "@/actions/schedules";
import { SiteErrorFallback } from "@/components/site-error-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { DroneStatusBadge, ScheduleStatusBadge } from "@/components/status-badge";
import { StatusDot } from "@/components/status-dot";
import { DataRow } from "@/components/data-row";

export const Route = createFileRoute("/dashboard/drones/$droneId/")({
  component: DroneDetailsPage,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: droneKeys.detail(params.droneId),
      queryFn: () => dronesApi.getById(params.droneId),
    });
    return null;
  },
});

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">
      {children}
    </p>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Dubai",
  }).toUpperCase();
}

const statusVariant: Record<DroneStatus, "live" | "warn" | "down"> = {
  AVAILABLE:      "live",
  MAINTENANCE:    "warn",
  OUT_OF_SERVICE: "down",
};

const scheduleStatusVariant: Record<ScheduleStatus, "live" | "warn" | "ok" | "idle"> = {
  IN_PROGRESS: "live",
  ASSIGNED:    "warn",
  COMPLETED:   "ok",
  CANCELLED:   "idle",
};

function DroneDetailsPage() {
  const { droneId } = Route.useParams();
  const { data: drone, isLoading, error } = useDrone(droneId);

  if (error) return <SiteErrorFallback error={error} title="Failed to load drone" />;

  const schedules = drone?.schedules ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" className="hover:text-primary transition-colors" asChild>
            <Link to="/dashboard/drones"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-48 mb-1" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <StatusDot variant={statusVariant[drone?.status as DroneStatus] ?? "idle"} />
                  <h1 className="text-2xl font-display font-bold">{drone?.name}</h1>
                </div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  {drone?.serialNumber ?? droneId.slice(0, 8).toUpperCase()}
                </p>
              </>
            )}
          </div>
        </div>
        {drone && (
          <Link to="/dashboard/drones/$droneId/edit" params={{ droneId }}>
            <Button variant="outline" size="sm">
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-[6px] border border-border p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-24 shrink-0" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      ) : drone ? (
        <>
          {/* Drone info */}
          <div className="rounded-[6px] border border-border px-5 py-4">
            <SectionLabel>Fleet Record</SectionLabel>
            <div className="space-y-0">
              <DataRow label="Name" value={drone.name} />
              <DataRow label="Serial" value={drone.serialNumber} mono />
              <DataRow
                label="Status"
                value={
                  <DroneStatusBadge
                    status={drone.status}
                    label={DRONE_STATUS_LABELS[drone.status as DroneStatus] ?? drone.status}
                  />
                }
              />
              {/* TODO: backend addition needed — lastServiceAt, batteryCycles */}
            </div>
          </div>

          {/* Schedules */}
          <div className="rounded-[6px] border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-card/40">
              <SectionLabel>Schedules ({schedules.length})</SectionLabel>
            </div>
            {schedules.length === 0 ? (
              <p className="text-muted-foreground text-sm px-5 py-6">No schedules for this drone.</p>
            ) : (
              schedules.map((s) => {
                const statusLabel = SCHEDULE_STATUS_LABELS[s.status as ScheduleStatus] ?? s.status;
                return (
                  <Link
                    key={s.id}
                    to="/dashboard/schedules/$scheduleId"
                    params={{ scheduleId: s.id }}
                    className="relative flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-card/60 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary before:opacity-0 hover:before:opacity-100 before:transition-opacity transition-colors"
                  >
                    <StatusDot
                      variant={scheduleStatusVariant[s.status as ScheduleStatus] ?? "idle"}
                      pulse={s.status === "IN_PROGRESS"}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm leading-tight truncate">
                        {s.job?.site?.name ? `${s.job.site.name} — ` : ""}{s.job?.name ?? s.job?.id ?? ""}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        {formatTime(s.startAt)} · {s.pilot?.name ?? "—"}
                      </p>
                    </div>
                    {s.status && <ScheduleStatusBadge status={s.status} label={statusLabel} />}
                  </Link>
                );
              })
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
