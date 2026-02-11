import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowLeft } from "lucide-react";
import { JobForm } from "@/components/job-form";
import { useCreateJob, type CreateJobRequest } from "@/actions/jobs";

export const Route = createFileRoute("/dashboard/jobs/new")({
  component: NewJobPage,
});

function NewJobPage() {
  const navigate = useNavigate();
  const createJob = useCreateJob({
    onSuccess: () => {
      navigate({ to: "/dashboard/jobs" });
    },
  });

  const handleSubmit = (data: CreateJobRequest) => {
    createJob.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Briefcase className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Job</h1>
            <p className="text-muted-foreground">Create a new job</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <JobForm
          onSubmit={handleSubmit}
          isSubmitting={createJob.isPending}
          submitLabel="Create Job"
        />
      </div>
    </div>
  );
}
