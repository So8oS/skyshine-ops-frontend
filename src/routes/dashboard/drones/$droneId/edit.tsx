import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Plane, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { DroneForm } from "@/components/drone-form";
import {
  useDrone,
  useUpdateDrone,
  useDeleteDrone,
  dronesApi,
  droneKeys,
  type CreateDroneRequest,
  type UpdateDroneRequest,
} from "@/actions/drones";
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

export const Route = createFileRoute("/dashboard/drones/$droneId/edit")({
  component: EditDronePage,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: droneKeys.detail(params.droneId),
      queryFn: () => dronesApi.getById(params.droneId),
    });
    return null;
  },
});

function EditDronePage() {
  const { droneId } = Route.useParams();
  const navigate = useNavigate();

  const { data: drone, isLoading, error } = useDrone(droneId);

  const updateDrone = useUpdateDrone({
    onSuccess: () => {
      navigate({ to: "/dashboard/drones" });
    },
  });

  const deleteDrone = useDeleteDrone({
    onSuccess: () => {
      navigate({ to: "/dashboard/drones" });
    },
  });

  const handleSubmit = (data: CreateDroneRequest) => {
    const updateData: UpdateDroneRequest = {
      name: data.name,
      serialNumber: data.serialNumber,
      status: data.status,
    };
    updateDrone.mutate({ id: droneId, data: updateData });
  };

  const handleDelete = () => {
    deleteDrone.mutate(droneId);
  };

  const hasSchedules = (drone?.schduals?.length ?? 0) > 0;

  if (error) {
    return <SiteErrorFallback error={error} title="Failed to load drone" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/drones">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Plane className="h-6 w-6 text-orange-500" />
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
                    Edit {drone?.name}
                  </h1>
                  <p className="text-muted-foreground">Update drone details</p>
                </>
              )}
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={isLoading || deleteDrone.isPending || hasSchedules}
            >
              {deleteDrone.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Drone
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Drone</AlertDialogTitle>
              <AlertDialogDescription>
                {hasSchedules
                  ? "This drone has schedules. Cancel or delete schedules first, then you can delete the drone."
                  : `Are you sure you want to delete "${drone?.name}" (${drone?.serialNumber})? This action cannot be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {!hasSchedules && (
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              )}
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
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : drone ? (
          <DroneForm
            initialData={drone}
            onSubmit={handleSubmit}
            isSubmitting={updateDrone.isPending}
            submitLabel="Update Drone"
          />
        ) : null}
      </div>
    </div>
  );
}
