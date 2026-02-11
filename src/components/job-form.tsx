import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2 } from "lucide-react";
import {
  CreateJobInput,
  type CreateJobRequest,
  type Job,
  JOB_TYPE_LABELS,
  type JobType,
} from "@/actions/jobs";
import { useSites } from "@/actions/sites";

interface JobFormProps {
  initialData?: Job;
  onSubmit: (data: CreateJobRequest) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function JobForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Job",
}: JobFormProps) {
  const { data: sitesData } = useSites({ pageSize: 100 });
  const sites = sitesData?.items ?? [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateJobRequest>({
    resolver: zodResolver(CreateJobInput),
    defaultValues: {
      name: initialData?.name ?? "",
      siteId: initialData?.siteId ?? "",
      type: initialData?.type ?? "INSPECTION",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Job Name *</Label>
            <Input
              id="name"
              placeholder="Enter job name"
              {...register("name")}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Site *</Label>
            <Controller
              name="siteId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting || !!initialData}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                        {site.code ? ` (${site.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {initialData && (
              <p className="text-xs text-muted-foreground">
                Site cannot be changed when editing.
              </p>
            )}
            {errors.siteId && (
              <p className="text-sm text-destructive">{errors.siteId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type *</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {JOB_TYPE_LABELS[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
