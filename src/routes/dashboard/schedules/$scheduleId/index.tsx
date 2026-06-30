import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  useSchedule,
  useDeleteSchedule,
  schedulesApi,
  scheduleKeys,
  SCHEDULE_STATUS_LABELS,
  type ScheduleStatus,
} from "@/actions/schedules";
import { SiteErrorFallback } from "@/components/site-error-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { ScheduleStatusBadge } from "@/components/status-badge";
import { StatusDot } from "@/components/status-dot";
import { DataRow } from "@/components/data-row";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/dashboard/schedules/$scheduleId/")({
  component: ScheduleDetailsPage,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: scheduleKeys.detail(params.scheduleId),
      queryFn: () => schedulesApi.getById(params.scheduleId),
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

const statusVariant: Record<ScheduleStatus, "live" | "warn" | "ok" | "idle"> = {
  IN_PROGRESS: "live",
  ASSIGNED:    "warn",
  COMPLETED:   "ok",
  CANCELLED:   "idle",
};

function ScheduleDetailsPage() {
  const { scheduleId } = Route.useParams();
  const navigate = useNavigate();
  const { data: schedule, isLoading, error } = useSchedule(scheduleId);
  const deleteSchedule = useDeleteSchedule({
    onSuccess: () => navigate({ to: "/dashboard/schedules" }),
  });

  if (error) return <SiteErrorFallback error={error} title="Failed to load schedule" />;

  const status = schedule?.status as ScheduleStatus | undefined;
  const statusLabel = status ? SCHEDULE_STATUS_LABELS[status] ?? status : null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" className="hover:text-primary transition-colors" asChild>
            <Link to="/dashboard/schedules"><ArrowLeft className="h-4 w-4" /></Link>
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
                  {status && (
                    <StatusDot
                      variant={statusVariant[status] ?? "idle"}
                      pulse={status === "IN_PROGRESS"}
                    />
                  )}
                  <h1 className="text-2xl font-display font-bold">
                    {schedule?.job?.site?.name
                      ? `${schedule.job.site.name} — ${schedule.job?.name ?? schedule.jobId}`
                      : (schedule?.job?.name ?? schedule?.jobId ?? "Schedule")}
                  </h1>
                </div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  SCH-{scheduleId.slice(0, 8).toUpperCase()}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {schedule && (
            <Link to="/dashboard/schedules/$scheduleId/edit" params={{ scheduleId }}>
              <Button variant="outline" size="sm">
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            </Link>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isLoading || deleteSchedule.isPending}
              >
                {deleteSchedule.isPending
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Trash2 className="h-3.5 w-3.5" />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this schedule? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteSchedule.mutate(scheduleId)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-[6px] border border-border p-5 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-24 shrink-0" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      ) : schedule ? (
        <div className="space-y-4">
          {/* Status */}
          <div className="rounded-[6px] border border-border px-5 py-4">
            <SectionLabel>Status</SectionLabel>
            <div className="flex items-center gap-2">
              {status && (
                <StatusDot
                  variant={statusVariant[status] ?? "idle"}
                  pulse={status === "IN_PROGRESS"}
                />
              )}
              {statusLabel && (
                <ScheduleStatusBadge status={schedule.status} label={statusLabel} />
              )}
            </div>
          </div>

          {/* Mission */}
          <div className="rounded-[6px] border border-border px-5 py-4">
            <SectionLabel>Mission</SectionLabel>
            <div className="space-y-0">
              <DataRow label="Site" value={schedule.job?.site?.name} />
              <DataRow label="Job" value={schedule.job?.name ?? schedule.jobId} />
            </div>
          </div>

          {/* Crew */}
          <div className="rounded-[6px] border border-border px-5 py-4">
            <SectionLabel>Crew</SectionLabel>
            <div className="space-y-0">
              <DataRow label="Pilot" value={schedule.pilot?.name ?? schedule.pilotId} />
              <DataRow label="Email" value={schedule.pilot?.email} mono />
              <DataRow label="Drone" value={schedule.drone?.name ?? schedule.droneId} />
              <DataRow label="Serial" value={schedule.drone?.serialNumber} mono />
            </div>
          </div>

          {/* Timing */}
          <div className="rounded-[6px] border border-border px-5 py-4">
            <SectionLabel>Timing (AUH)</SectionLabel>
            <div className="space-y-0">
              <DataRow label="Start" value={formatTime(schedule.startAt)} mono />
              <DataRow label="End" value={formatTime(schedule.endAt)} mono />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
