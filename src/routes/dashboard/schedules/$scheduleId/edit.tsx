import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { ScheduleForm } from "@/components/schedule-form";
import {
  useSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  schedulesApi,
  scheduleKeys,
  type CreateScheduleRequest,
  type UpdateScheduleRequest,
  type ScheduleApiError,
} from "@/actions/schedules";
import { SiteErrorFallback } from "@/components/site-error-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

export const Route = createFileRoute("/dashboard/schedules/$scheduleId/edit")({
  component: EditSchedulePage,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: scheduleKeys.detail(params.scheduleId),
      queryFn: () => schedulesApi.getById(params.scheduleId),
    });
    return null;
  },
});

function EditSchedulePage() {
  const { scheduleId } = Route.useParams();
  const navigate = useNavigate();

  const { data: schedule, isLoading, error } = useSchedule(scheduleId);

  const updateSchedule = useUpdateSchedule({
    onSuccess: () => navigate({ to: "/dashboard/schedules" }),
    onConflict: (err: ScheduleApiError, conflict) => {
      if (conflict) console.warn("Conflict:", err.response?.data?.error, conflict);
    },
  });

  const deleteSchedule = useDeleteSchedule({
    onSuccess: () => navigate({ to: "/dashboard/schedules" }),
  });

  const handleSubmit = (data: CreateScheduleRequest) => {
    const updateData: UpdateScheduleRequest = {
      pilotId: data.pilotId,
      droneId: data.droneId,
      startAt: data.startAt,
      endAt: data.endAt,
      status: data.status,
    };
    updateSchedule.mutate({ id: scheduleId, data: updateData });
  };

  if (error) return <SiteErrorFallback error={error} title="Failed to load schedule" />;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" className="hover:text-primary transition-colors" asChild>
          <Link to="/dashboard/schedules"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-display font-bold">Edit Schedule</h1>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  EDIT · SCHEDULE · SCH-{scheduleId.slice(0, 8).toUpperCase()}
                </p>
              </>
            )}
        </div>
      </div>

      {/* Form */}
      {isLoading ? (
        <Card>
          <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : schedule ? (
        <ScheduleForm
          initialData={schedule}
          onSubmit={handleSubmit}
          isSubmitting={updateSchedule.isPending}
          submitLabel="Save Changes"
          isEdit
        />
      ) : null}

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Delete this schedule</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This action is permanent and cannot be undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isLoading || deleteSchedule.isPending}
              >
                {deleteSchedule.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Trash2 className="h-4 w-4" />}
                DELETE SCHEDULE
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
                  className="bg-destructive text-white hover:bg-destructive/85"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
