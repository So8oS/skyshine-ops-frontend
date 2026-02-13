import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2 } from "lucide-react";
import {
  CreateSiteInput,
  type CreateSiteRequest,
  type Site,
  EMIRATES,
  ASSET_TYPE_LABELS,
  GLASS_SURFACE_TYPE_LABELS,
  ACCESS_CONSTRAINT_LABELS,
  type AssetType,
  type GlassSurfaceType,
  type AccessConstraint,
} from "@/actions/sites";

interface SiteFormProps {
  initialData?: Site;
  onSubmit: (data: CreateSiteRequest) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function SiteForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Site",
}: SiteFormProps) {
  type SiteFormValues = z.input<typeof CreateSiteInput>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SiteFormValues, unknown, CreateSiteRequest>({
    resolver: zodResolver(CreateSiteInput),
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      Description: initialData?.Description ?? "",
      siteManager: initialData?.siteManager ?? "",
      phone: initialData?.phone ?? "",
      code: initialData?.code ?? "",
      emirate: initialData?.emirate ?? "",
      city: initialData?.city ?? "",
      assetType: initialData?.assetType ?? undefined,
      glassSurfaceType: initialData?.glassSurfaceType ?? undefined,
      maxApprovedPressure: initialData?.maxApprovedPressure ?? undefined,
      height: initialData?.height ?? undefined,
      panelWidth: initialData?.panelWidth ?? undefined,
      panelHeight: initialData?.panelHeight ?? undefined,
      tetherRequired: initialData?.tetherRequired ?? false,
      estimatedTime: initialData?.estimatedTime ?? undefined,
      actualTime: initialData?.actualTime ?? undefined,
      accessConstraints: initialData?.accessConstraints ?? [],
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Site Name *</Label>
            <Input
              id="name"
              placeholder="Enter site name"
              {...register("name")}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Site Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Site Code (Optional)</Label>
            <Input
              id="code"
              placeholder="Enter site code"
              {...register("code")}
              disabled={isSubmitting}
            />
          </div>

          {/* Emirate */}
          <div className="space-y-2">
            <Label>Emirate (Optional)</Label>
            <Controller
              name="emirate"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select emirate" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMIRATES.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City (Optional)</Label>
            <Input
              id="city"
              placeholder="Enter city"
              {...register("city")}
              disabled={isSubmitting}
            />
          </div>

          {/* Site Manager */}
          <div className="space-y-2">
            <Label htmlFor="siteManager">Site Manager *</Label>
            <Input
              id="siteManager"
              placeholder="Enter site manager name"
              {...register("siteManager")}
              disabled={isSubmitting}
            />
            {errors.siteManager && (
              <p className="text-sm text-destructive">
                {errors.siteManager.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              {...register("phone")}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register("email")}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="Description">Description (Optional)</Label>
            <Textarea
              id="Description"
              placeholder="Enter site description"
              rows={3}
              {...register("Description")}
              disabled={isSubmitting}
            />
            {errors.Description && (
              <p className="text-sm text-destructive">
                {errors.Description.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asset Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Asset Type */}
          <div className="space-y-2">
            <Label>Asset Type (Optional)</Label>
            <Controller
              name="assetType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v || undefined)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ASSET_TYPE_LABELS) as AssetType[]).map(
                      (k) => (
                        <SelectItem key={k} value={k}>
                          {ASSET_TYPE_LABELS[k]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Glass / Surface Type */}
          <div className="space-y-2">
            <Label>Glass / Surface Type (Optional)</Label>
            <Controller
              name="glassSurfaceType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v || undefined)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(GLASS_SURFACE_TYPE_LABELS) as GlassSurfaceType[]).map(
                      (k) => (
                        <SelectItem key={k} value={k}>
                          {GLASS_SURFACE_TYPE_LABELS[k]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Max Approved Pressure (PSI) */}
          <div className="space-y-2">
            <Label htmlFor="maxApprovedPressure">
              Max Approved Pressure (PSI) (Optional)
            </Label>
            <Input
              id="maxApprovedPressure"
              type="number"
              min={0}
              placeholder="e.g. 100"
              {...register("maxApprovedPressure")}
              disabled={isSubmitting}
            />
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="height">Height (m) (Optional)</Label>
            <Input
              id="height"
              type="number"
              min={0}
              placeholder="e.g. 10"
              {...register("height")}
              disabled={isSubmitting}
            />
          </div>

          {/* Panel Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="panelWidth">Panel Width (Optional)</Label>
              <Input
                id="panelWidth"
                type="number"
                min={0}
                placeholder="Width"
                {...register("panelWidth")}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="panelHeight">Panel Height (Optional)</Label>
              <Input
                id="panelHeight"
                type="number"
                min={0}
                placeholder="Height"
                {...register("panelHeight")}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Tether Required */}
          <div className="flex items-center space-x-2">
            <Controller
              name="tetherRequired"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="tetherRequired"
                  checked={field.value ?? false}
                  onChange={(event) => field.onChange(event.target.checked)}
                  disabled={isSubmitting}
                />
              )}
            />
            <Label htmlFor="tetherRequired" className="font-normal cursor-pointer">
              Tether required
            </Label>
          </div>

          {/* Estimated Time / Actual Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">
                Estimated Time (minutes) (Optional)
              </Label>
              <Input
                id="estimatedTime"
                type="number"
                min={0}
                placeholder="e.g. 60"
                {...register("estimatedTime")}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualTime">
                Actual Time (minutes) (Optional)
              </Label>
              <Input
                id="actualTime"
                type="number"
                min={0}
                placeholder="e.g. 45"
                {...register("actualTime")}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Access Constraints */}
          <div className="space-y-2">
            <Label>Access Constraints (Optional)</Label>
            <div className="flex flex-wrap gap-4 pt-2">
              <Controller
                name="accessConstraints"
                control={control}
                render={({ field }) => (
                  <>
                    {(Object.keys(ACCESS_CONSTRAINT_LABELS) as AccessConstraint[]).map(
                      (key) => {
                        const selected = field.value ?? [];
                        const isChecked = selected.includes(key);
                        return (
                          <div
                            key={key}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`access-${key}`}
                              checked={isChecked}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  field.onChange([...selected, key]);
                                } else {
                                  field.onChange(selected.filter((c) => c !== key));
                                }
                              }}
                              disabled={isSubmitting}
                            />
                            <Label
                              htmlFor={`access-${key}`}
                              className="font-normal cursor-pointer text-sm"
                            >
                              {ACCESS_CONSTRAINT_LABELS[key]}
                            </Label>
                          </div>
                        );
                      }
                    )}
                  </>
                )}
              />
            </div>
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
