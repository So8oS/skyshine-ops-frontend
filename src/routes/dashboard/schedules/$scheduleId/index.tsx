import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  useSchedule,
  useDeleteSchedule,
  schedulesApi,
  scheduleKeys,
  SCHEDULE_STATUS_LABELS,
} from "@/actions/schedules";
import { SiteErrorFallback } from "@/components/site-error-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function formatScheduleTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ScheduleDetailsPage() {
  const { scheduleId } = Route.useParams();
  const { data: schedule, isLoading, error } = useSchedule(scheduleId);
  const deleteSchedule = useDeleteSchedule({
    onSuccess: () => {
      window.history.back();
    },
  });

  if (error) {
    return (
      <SiteErrorFallback error={error} title="Failed to load schedule" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/schedules">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-48 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Schedule Details
                  </h1>
                  <p className="text-muted-foreground">
                    {schedule?.job?.name ?? schedule?.jobId}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/dashboard/schedules/$scheduleId/edit"
            params={{ scheduleId }}
          >
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isLoading || deleteSchedule.isPending}
              >
                {deleteSchedule.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this schedule? This action
                  cannot be undone.
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-48" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : schedule ? (
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Site</p>
              <p className="font-medium">
                {schedule.job?.site?.name ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">
                <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                  {SCHEDULE_STATUS_LABELS[schedule.status]}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Job</p>
              <p className="font-medium">{schedule.job?.name ?? schedule.jobId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pilot</p>
              <p className="font-medium">
                {schedule.pilot?.name ?? schedule.pilotId}
                {schedule.pilot?.email ? (
                  <span className="text-muted-foreground ml-2 text-sm">
                    {schedule.pilot.email}
                  </span>
                ) : null}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Drone</p>
              <p className="font-medium">
                {schedule.drone?.name ?? schedule.droneId}
                {schedule.drone?.serialNumber ? (
                  <span className="text-muted-foreground ml-2 text-sm">
                    {schedule.drone.serialNumber}
                  </span>
                ) : null}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start</p>
              <p className="font-medium">{formatScheduleTime(schedule.startAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End</p>
              <p className="font-medium">{formatScheduleTime(schedule.endAt)}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
