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
  CreateDroneInput,
  type CreateDroneRequest,
  type Drone,
  DRONE_STATUS_LABELS,
  type DroneStatus,
} from "@/actions/drones";

interface DroneFormProps {
  initialData?: Drone;
  onSubmit: (data: CreateDroneRequest) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function DroneForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Drone",
}: DroneFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateDroneRequest>({
    resolver: zodResolver(CreateDroneInput),
    defaultValues: {
      name: initialData?.name ?? "",
      serialNumber: initialData?.serialNumber ?? "",
      status: initialData?.status ?? "AVAILABLE",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Drone Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g. DJI Phantom 4"
              {...register("name")}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number *</Label>
            <Input
              id="serialNumber"
              placeholder="e.g. SN-12345"
              {...register("serialNumber")}
              disabled={isSubmitting}
            />
            {errors.serialNumber && (
              <p className="text-sm text-destructive">
                {errors.serialNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status *</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? "AVAILABLE"}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(DRONE_STATUS_LABELS) as DroneStatus[]).map(
                      (k) => (
                        <SelectItem key={k} value={k}>
                          {DRONE_STATUS_LABELS[k]}
                        </SelectItem>
                      )
                    )}
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
