import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  CreateScheduleInput,
  type CreateScheduleRequest,
  SCHEDULE_STATUS_LABELS,
  type ScheduleStatus,
  useAvailability,
} from "@/actions/schedules";
import { useJobs } from "@/actions/jobs";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const AddScheduleFormInput = z
  .object({
    jobId: z.string().uuid("Invalid job"),
    pilotId: z.string().uuid("Invalid pilot"),
    droneId: z.string().uuid("Invalid drone"),
    startDate: z.string().min(1, "Start date is required"),
    startTime: z.string().regex(timeRegex, "Start time is required"),
    endDate: z.string().min(1, "End date is required"),
    endTime: z.string().regex(timeRegex, "End time is required"),
    status: z
      .enum(["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
      .default("ASSIGNED"),
  })
  .superRefine((data, ctx) => {
    const startAt = combineDateAndTime(data.startDate, data.startTime);
    const endAt = combineDateAndTime(data.endDate, data.endTime);

    if (!startAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "Invalid start date/time",
      });
    }

    if (!endAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "Invalid end date/time",
      });
    }

    if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End must be after start",
      });
    }
  });

type AddScheduleFormValues = z.infer<typeof AddScheduleFormInput>;

function combineDateAndTime(date: string, time: string): string | null {
  if (!date || !time || !timeRegex.test(time)) return null;
  const localDateTime = new Date(`${date}T${time}:00`);
  if (Number.isNaN(localDateTime.getTime())) return null;
  return localDateTime.toISOString();
}

interface AddScheduleFormProps {
  onSubmit: (data: CreateScheduleRequest) => void;
  isSubmitting?: boolean;
}

export function AddScheduleForm({
  onSubmit,
  isSubmitting = false,
}: AddScheduleFormProps) {
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ pageSize: 100 });
  const jobs = jobsData?.items ?? [];

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<AddScheduleFormValues>({
    resolver: zodResolver(AddScheduleFormInput),
    defaultValues: {
      jobId: "",
      pilotId: "",
      droneId: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      status: "ASSIGNED",
    },
  });

  const startDate = watch("startDate");
  const startTime = watch("startTime");
  const endDate = watch("endDate");
  const endTime = watch("endTime");

  const startAt = useMemo(
    () => combineDateAndTime(startDate, startTime),
    [startDate, startTime]
  );
  const endAt = useMemo(
    () => combineDateAndTime(endDate, endTime),
    [endDate, endTime]
  );
  const hasValidRange =
    !!startAt && !!endAt && new Date(endAt).getTime() > new Date(startAt).getTime();

  const { data: availability, isLoading: availabilityLoading } = useAvailability(
    hasValidRange ? startAt : null,
    hasValidRange ? endAt : null
  );

  const pilotOptions = availability?.availablePilots ?? [];
  const droneOptions = availability?.availableDrones ?? [];
  const noPilotsAvailable = hasValidRange && !availabilityLoading && pilotOptions.length === 0;
  const noDronesAvailable = hasValidRange && !availabilityLoading && droneOptions.length === 0;

  const submitHandler = (values: AddScheduleFormValues) => {
    const payload: CreateScheduleRequest = {
      jobId: values.jobId,
      pilotId: values.pilotId,
      droneId: values.droneId,
      startAt: combineDateAndTime(values.startDate, values.startTime) ?? "",
      endAt: combineDateAndTime(values.endDate, values.endTime) ?? "",
      status: values.status,
    };

    const parsedPayload = CreateScheduleInput.safeParse(payload);
    if (!parsedPayload.success) return;
    onSubmit(parsedPayload.data);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
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
                  disabled={isSubmitting || jobsLoading}
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
            {errors.jobId && (
              <p className="text-sm text-destructive">{errors.jobId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date *</Label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <Input
                    id="startDate"
                    type="date"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start time *</Label>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <Input
                    id="startTime"
                    type="time"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End date *</Label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <Input
                    id="endDate"
                    type="date"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End time *</Label>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <Input
                    id="endTime"
                    type="time"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {!hasValidRange && (startDate || startTime || endDate || endTime) && (
            <p className="text-sm text-muted-foreground">
              Set a valid range (end after start) to load available pilots and drones.
            </p>
          )}
          {hasValidRange && availabilityLoading && (
            <p className="text-sm text-muted-foreground">
              Checking pilot and drone availability for this time range...
            </p>
          )}
          {hasValidRange && !availabilityLoading && (noPilotsAvailable || noDronesAvailable) && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              {noPilotsAvailable && noDronesAvailable
                ? "No pilots or drones are available for this time range. Try another date/time."
                : noPilotsAvailable
                  ? "No pilots are available for this time range. Try another date/time."
                  : "No drones are available for this time range. Try another date/time."}
            </div>
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
                  disabled={
                    isSubmitting ||
                    !hasValidRange ||
                    availabilityLoading ||
                    noPilotsAvailable
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !hasValidRange
                          ? "Pick time range first"
                          : availabilityLoading
                            ? "Checking availability..."
                            : noPilotsAvailable
                              ? "No pilots available for selected time"
                              : "Select pilot"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {pilotOptions.map((pilot) => (
                      <SelectItem key={pilot.id} value={pilot.id}>
                        {pilot.name}
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
                  disabled={
                    isSubmitting ||
                    !hasValidRange ||
                    availabilityLoading ||
                    noDronesAvailable
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !hasValidRange
                          ? "Pick time range first"
                          : availabilityLoading
                            ? "Checking availability..."
                            : noDronesAvailable
                              ? "No drones available for selected time"
                              : "Select drone"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {droneOptions.map((drone) => (
                      <SelectItem key={drone.id} value={drone.id}>
                        {drone.name} {drone.serialNumber ? `(${drone.serialNumber})` : ""}
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
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SCHEDULE_STATUS_LABELS) as ScheduleStatus[]).map((status) => (
                      <SelectItem key={status} value={status}>
                        {SCHEDULE_STATUS_LABELS[status]}
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
          Create Schedule
        </Button>
      </div>
    </form>
  );
}
