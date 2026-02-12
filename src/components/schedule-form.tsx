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
import { DateTimePicker } from "./date-time-picker";
import { Loader2 } from "lucide-react";
import {
  CreateScheduleInput,
  type CreateScheduleRequest,
  type UpdateScheduleRequest,
  type Schedule,
  SCHEDULE_STATUS_LABELS,
  type ScheduleStatus,
  useAvailability,
} from "@/actions/schedules";
import { useJobs } from "@/actions/jobs";

/** Format ISO string for datetime-local input (YYYY-MM-DDTHH:mm) */
function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert datetime-local value to ISO string */
function fromDateTimeLocal(value: string): string {
  if (!value) return "";
  return new Date(value).toISOString();
}

interface ScheduleFormProps {
  initialData?: Schedule;
  onSubmit: (data: CreateScheduleRequest | UpdateScheduleRequest) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  isEdit?: boolean;
}

export function ScheduleForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Schedule",
  isEdit = false,
}: ScheduleFormProps) {
  const { data: jobsData } = useJobs({ pageSize: 100 });
  const jobs = jobsData?.items ?? [];

  const initialStart = initialData?.startAt ?? null;
  const initialEnd = initialData?.endAt ?? null;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateScheduleRequest>({
    resolver: zodResolver(CreateScheduleInput),
    defaultValues: {
      jobId: initialData?.jobId ?? "",
      pilotId: initialData?.pilotId ?? "",
      droneId: initialData?.droneId ?? "",
      startAt: initialData?.startAt ? toDateTimeLocal(initialData.startAt) : "",
      endAt: initialData?.endAt ? toDateTimeLocal(initialData.endAt) : "",
      status: initialData?.status ?? "ASSIGNED",
    },
  });

  const watchedStart = watch("startAt");
  const watchedEnd = watch("endAt");
  const startIso = watchedStart ? fromDateTimeLocal(watchedStart) : null;
  const endIso = watchedEnd ? fromDateTimeLocal(watchedEnd) : null;
  const validRange = startIso && endIso && new Date(endIso) > new Date(startIso);

  const availabilityStart = validRange ? startIso : (isEdit ? initialStart : null);
  const availabilityEnd = validRange ? endIso : (isEdit ? initialEnd : null);

  const { data: availability, isLoading: availabilityLoading } = useAvailability(
    availabilityStart,
    availabilityEnd
  );

  const pilots = availability?.availablePilots;
  const drones = availability?.availableDrones;

  const pilotOptions = (() => {
    const list = pilots ?? [];
    if (initialData?.pilotId && !list.some((p) => p.id === initialData.pilotId)) {
      return [
        { id: initialData.pilotId, name: initialData.pilot?.name ?? "Current pilot", email: undefined, phone: undefined },
        ...list,
      ];
    }
    return list;
  })();

  const droneOptions = (() => {
    const list = drones ?? [];
    if (initialData?.droneId && !list.some((d) => d.id === initialData.droneId)) {
      return [
        { id: initialData.droneId, name: initialData.drone?.name ?? "Current drone", serialNumber: "", status: "" },
        ...list,
      ];
    }
    return list;
  })();

  const handleFormSubmit = (data: CreateScheduleRequest) => {
    const payload: CreateScheduleRequest = {
      ...data,
      startAt: fromDateTimeLocal(data.startAt),
      endAt: fromDateTimeLocal(data.endAt),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Job *</Label>
            <Controller
              name="jobId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting || isEdit}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.name}
                        {job.site?.name ? ` · ${job.site.name}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {isEdit && (
              <p className="text-xs text-muted-foreground">Job cannot be changed when editing.</p>
            )}
            {errors.jobId && (
              <p className="text-sm text-destructive">{errors.jobId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Controller
              name="startAt"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  label="Start *"
                  id="startAt"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  error={errors.startAt?.message}
                />
              )}
            />
            <Controller
              name="endAt"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  label="End *"
                  id="endAt"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  error={errors.endAt?.message}
                />
              )}
            />
          </div>

          {!isEdit && !validRange && (watchedStart || watchedEnd) && (
            <p className="text-sm text-muted-foreground">
              Set start and end (end after start) to see available pilots and drones.
            </p>
          )}

          <div className="space-y-2">
            <Label>Pilot *</Label>
            <Controller
              name="pilotId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting || (!isEdit && !validRange) || availabilityLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !isEdit && !validRange
                          ? "Pick time range first"
                          : "Select pilot"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {pilotOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.pilotId && (
              <p className="text-sm text-destructive">{errors.pilotId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Drone *</Label>
            <Controller
              name="droneId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting || (!isEdit && !validRange) || availabilityLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !isEdit && !validRange
                          ? "Pick time range first"
                          : "Select drone"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {droneOptions.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} {d.serialNumber ? `(${d.serialNumber})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.droneId && (
              <p className="text-sm text-destructive">{errors.droneId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? "ASSIGNED"}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SCHEDULE_STATUS_LABELS) as ScheduleStatus[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {SCHEDULE_STATUS_LABELS[k]}
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
