import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
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
  const updateDrone = useUpdateDrone({ onSuccess: () => navigate({ to: "/dashboard/drones" }) });
  const deleteDrone = useDeleteDrone({ onSuccess: () => navigate({ to: "/dashboard/drones" }) });

  const handleSubmit = (data: CreateDroneRequest) => {
    const updateData: UpdateDroneRequest = {
      name: data.name,
      serialNumber: data.serialNumber,
      status: data.status,
    };
    updateDrone.mutate({ id: droneId, data: updateData });
  };

  const hasSchedules = (drone?.schduals?.length ?? 0) > 0;

  if (error) return <SiteErrorFallback error={error} title="Failed to load drone" />;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" className="hover:text-primary transition-colors" asChild>
          <Link to="/dashboard/drones"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-display font-bold">{drone?.name}</h1>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  EDIT · DRONE · {drone?.serialNumber ?? droneId.slice(0, 8).toUpperCase()}
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
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : drone ? (
        <DroneForm
          initialData={drone}
          onSubmit={handleSubmit}
          isSubmitting={updateDrone.isPending}
          submitLabel="Save Changes"
        />
      ) : null}

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Delete this drone</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasSchedules
                ? "Cancel or delete all schedules first before deleting this drone."
                : "This action is permanent and cannot be undone."}
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isLoading || deleteDrone.isPending || hasSchedules}
              >
                {deleteDrone.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Trash2 className="h-4 w-4" />}
                DELETE DRONE
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Drone</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{drone?.name}" ({drone?.serialNumber})? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteDrone.mutate(droneId)}
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
