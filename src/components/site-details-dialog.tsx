import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  Pencil,
  FileText,
  Briefcase,
  MapPin,
  Layers,
} from "lucide-react";
import type { Site } from "@/actions/sites";
import { useSiteJobsCount } from "@/actions/sites";
import {
  ASSET_TYPE_LABELS,
  GLASS_SURFACE_TYPE_LABELS,
  ACCESS_CONSTRAINT_LABELS,
  type AssetType,
  type GlassSurfaceType,
  type AccessConstraint,
} from "@/actions/sites";
import { Skeleton } from "./ui/skeleton";

interface SiteDetailsDialogProps {
  site: Site | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiteDetailsDialog({
  site,
  open,
  onOpenChange,
}: SiteDetailsDialogProps) {
  const { data: jobsCount = 0, isLoading: isLoadingJobsCount } = useSiteJobsCount(
    open ? site?.id ?? null : null
  );

  const details = site;

  if (!site) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <DialogTitle className="text-xl">
              {details?.name}
              {details?.code ? (
                <span className="text-muted-foreground font-normal ml-1">
                  ({details.code})
                </span>
              ) : null}
            </DialogTitle>
              <DialogDescription>Site details and information</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Site Manager – from list data, show immediately */}
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Site Manager</p>
              <p className="font-medium">{details?.siteManager ?? "—"}</p>
            </div>
          </div>

          {/* Email */}
          {(details?.email != null && details.email !== "") && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{details.email}</p>
              </div>
            </div>
          )}

          {/* Phone */}
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{details?.phone ?? "—"}</p>
            </div>
          </div>

          {/* Description */}
          {details?.Description != null && details.Description !== "" && (
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{details.Description}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Jobs Count – from lightweight GET /api/site/:id/jobs-count */}
          <div className="flex items-center gap-3">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Jobs</p>
              {isLoadingJobsCount ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <p className="font-medium">
                  {jobsCount} {jobsCount === 1 ? "job" : "jobs"} associated
                </p>
              )}
            </div>
          </div>

          {/* Created Date – from list data */}
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {details?.createdAt
                  ? new Date(details.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Asset Profile */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Asset Profile</p>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Emirate / City</p>
                  <p className="font-medium">
                    {[details?.emirate, details?.city].filter(Boolean).join(" / ") || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Asset Type</p>
                  <p className="font-medium">
                    {details?.assetType
                      ? ASSET_TYPE_LABELS[details.assetType as AssetType]
                      : "—"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Glass / Surface Type</p>
                <p className="font-medium">
                  {details?.glassSurfaceType
                    ? GLASS_SURFACE_TYPE_LABELS[details.glassSurfaceType as GlassSurfaceType]
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Max Approved Pressure (PSI)</p>
                <p className="font-medium">
                  {details?.maxApprovedPressure != null
                    ? details.maxApprovedPressure
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Height / Panel Dimensions</p>
                <p className="font-medium">
                  {details?.height != null
                    ? `${details.height} m`
                    : "—"}
                  {details?.panelWidth != null && details?.panelHeight != null
                    ? ` · ${details.panelWidth}×${details.panelHeight}`
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Tether Required</p>
                <p className="font-medium">
                  {details?.tetherRequired != null
                    ? details.tetherRequired
                      ? "Yes"
                      : "No"
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Estimated vs Actual Time (min)</p>
                <p className="font-medium">
                  {details?.estimatedTime != null || details?.actualTime != null
                    ? `${details?.estimatedTime ?? "—"} / ${details?.actualTime ?? "—"}`
                    : "—"}
                </p>
              </div>
              {details?.accessConstraints && details.accessConstraints.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1">Access Constraints</p>
                  <div className="flex flex-wrap gap-1">
                    {details.accessConstraints.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                      >
                        {ACCESS_CONSTRAINT_LABELS[c as AccessConstraint]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Link to="/dashboard/sites/$siteId/edit" params={{ siteId: site.id }}>
            <Button onClick={() => onOpenChange(false)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Site
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
