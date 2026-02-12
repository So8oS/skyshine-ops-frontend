import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import { ScheduleForm } from "@/components/schedule-form";
import {
  useCreateSchedule,
  type CreateScheduleRequest,
  type ScheduleApiError,
} from "@/actions/schedules";

export const Route = createFileRoute("/dashboard/schedules/new")({
  component: NewSchedulePage,
});

function NewSchedulePage() {
  const navigate = useNavigate();
  const createSchedule = useCreateSchedule({
    onSuccess: () => {
      navigate({ to: "/dashboard/schedules" });
    },
    onConflict: (error: ScheduleApiError, conflict) => {
      const msg = conflict
        ? `${error.response?.data?.error ?? "Conflict"} (blocking schedule: ${conflict.id})`
        : error.response?.data?.error;
      if (msg) console.warn("Schedule conflict:", msg);
    },
  });

  const handleSubmit = (data: CreateScheduleRequest) => {
    createSchedule.mutate(data);
  };

  return (
    <div className="space-y-6">
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
            <h1 className="text-2xl font-bold tracking-tight">
              Add Schedule
            </h1>
            <p className="text-muted-foreground">
              Create a new schedule (pick time range to see available pilots & drones)
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <ScheduleForm
          onSubmit={handleSubmit}
          isSubmitting={createSchedule.isPending}
          submitLabel="Create Schedule"
        />
      </div>
    </div>
  );
}
