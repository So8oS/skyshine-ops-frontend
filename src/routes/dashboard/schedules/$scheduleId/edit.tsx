import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Loader2, Trash2 } from "lucide-react";
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
    onSuccess: () => {
      navigate({ to: "/dashboard/schedules" });
    },
    onConflict: (err: ScheduleApiError, conflict) => {
      if (conflict) {
        console.warn("Conflict:", err.response?.data?.error, conflict);
      }
    },
  });

  const deleteSchedule = useDeleteSchedule({
    onSuccess: () => {
      navigate({ to: "/dashboard/schedules" });
    },
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

  const handleDelete = () => {
    deleteSchedule.mutate(scheduleId);
  };

  if (error) {
    return (
      <SiteErrorFallback error={error} title="Failed to load schedule" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
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
                  <Skeleton className="h-8 w-56 mb-1" />
                  <Skeleton className="h-4 w-40" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Edit Schedule
                  </h1>
                  <p className="text-muted-foreground">
                    {schedule?.job?.name ?? schedule?.jobId} ·{" "}
                    {schedule?.pilot?.name ?? schedule?.pilotId}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

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
              Delete Schedule
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this schedule? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="max-w-2xl">
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : schedule ? (
          <ScheduleForm
            initialData={schedule}
            onSubmit={handleSubmit}
            isSubmitting={updateSchedule.isPending}
            submitLabel="Update Schedule"
            isEdit
          />
        ) : null}
      </div>
    </div>
  );
}
