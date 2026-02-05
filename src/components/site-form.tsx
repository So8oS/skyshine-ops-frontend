import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2 } from "lucide-react";
import {
  CreateSiteInput,
  type CreateSiteRequest,
  type Site,
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSiteRequest>({
    resolver: zodResolver(CreateSiteInput),
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      Description: initialData?.Description ?? "",
      siteManager: initialData?.siteManager ?? "",
      phone: initialData?.phone ?? "",
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

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
