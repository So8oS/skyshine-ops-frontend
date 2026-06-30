import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DroneForm } from "@/components/drone-form";
import { useCreateDrone, type CreateDroneRequest } from "@/actions/drones";

export const Route = createFileRoute("/dashboard/drones/new")({
  component: NewDronePage,
});

function NewDronePage() {
  const navigate = useNavigate();
  const createDrone = useCreateDrone({
    onSuccess: () => {
      navigate({ to: "/dashboard/drones" });
    },
  });

  const handleSubmit = (data: CreateDroneRequest) => {
    createDrone.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/drones">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Drone</h1>
            <p className="text-muted-foreground">Register a new drone</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <DroneForm
          onSubmit={handleSubmit}
          isSubmitting={createDrone.isPending}
          submitLabel="Create Drone"
        />
      </div>
    </div>
  );
}
