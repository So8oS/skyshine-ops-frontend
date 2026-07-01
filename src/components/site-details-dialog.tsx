import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { MapPin } from "lucide-react";
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
import { DataRow } from "./data-row";

interface SiteDetailsDialogProps {
  site: Site | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">
      {children}
    </p>
  );
}

export function SiteDetailsDialog({
  site,
  open,
  onOpenChange,
}: SiteDetailsDialogProps) {
  const { data: jobsCount = 0, isLoading: isLoadingJobsCount } = useSiteJobsCount(
    open ? site?.id ?? null : null
  );

  if (!site) return null;

  const assetTypeLabel = site.assetType ? ASSET_TYPE_LABELS[site.assetType as AssetType] : null;
  const glassLabel = site.glassSurfaceType
    ? GLASS_SURFACE_TYPE_LABELS[site.glassSurfaceType as GlassSurfaceType]
    : null;
  const constraints = site.accessConstraints ?? [];
  const locationLine = [site.emirate, site.city].filter(Boolean).join(" · ") || null;
  const coordsLine =
    site.latitude != null && site.longitude != null
      ? `${Math.abs(site.latitude).toFixed(4)}° ${site.latitude >= 0 ? "N" : "S"} · ${Math.abs(site.longitude).toFixed(4)}° ${site.longitude >= 0 ? "E" : "W"}`
      : null;
  const createdLabel = site.createdAt
    ? new Date(site.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).toUpperCase()
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto p-0">
        <DialogDescription className="sr-only">Site details and information</DialogDescription>

        {/* Amber accent bar */}
        <div className="h-0.5 w-full bg-primary rounded-t-[6px]" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-display font-bold leading-tight">
            {site.name}
          </DialogTitle>
          {site.code && (
            <p className="font-mono text-sm text-primary/80 mt-0.5">{site.code}</p>
          )}
          {locationLine && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
              <MapPin className="h-3 w-3 shrink-0" />
              {locationLine}
            </p>
          )}
          {coordsLine && (
            <p className="font-mono text-[11px] text-muted-foreground/70 mt-1">
              {coordsLine}
            </p>
          )}
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Contact */}
          <div>
            <SectionLabel>Contact</SectionLabel>
            <div className="space-y-0">
              <DataRow label="Manager" value={site.siteManager} />
              <DataRow label="Email" value={site.email} mono />
              <DataRow label="Phone" value={site.phone} mono />
              <DataRow label="Description" value={site.Description} />
            </div>
          </div>

          {/* Asset Profile */}
          <div>
            <SectionLabel>Asset Profile</SectionLabel>
            <div className="space-y-0">
              <DataRow label="Asset Type" value={assetTypeLabel} />
              <DataRow label="Glass / Surface" value={glassLabel} />
              <DataRow
                label="Tether Required"
                value={site.tetherRequired ? "Yes" : "No"}
              />
              {site.maxApprovedPressure != null && (
                <DataRow
                  label="Max Pressure"
                  value={`${site.maxApprovedPressure} PSI`}
                  mono
                />
              )}
              {site.height != null && (
                <DataRow label="Height" value={`${site.height} m`} mono />
              )}
              {site.estimatedTime != null && (
                <DataRow label="Est. Time" value={`${site.estimatedTime} min`} mono />
              )}
            </div>

            {constraints.length > 0 && (
              <div className="mt-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">
                  Access Constraints
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {constraints.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center rounded-[3px] border border-primary/15 bg-primary/8 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary/90"
                    >
                      {ACCESS_CONSTRAINT_LABELS[c as AccessConstraint]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Operations */}
          <div>
            <SectionLabel>Operations</SectionLabel>
            <div className="space-y-0">
              <DataRow
                label="Associated Jobs"
                value={
                  isLoadingJobsCount ? (
                    <Skeleton className="h-4 w-10 inline-block" />
                  ) : (
                    `${jobsCount} ${jobsCount === 1 ? "job" : "jobs"}`
                  )
                }
                mono
              />
              {createdLabel && (
                <DataRow label="Created" value={createdLabel} mono />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Link to="/dashboard/sites/$siteId/edit" params={{ siteId: site.id }}>
            <Button size="sm" onClick={() => onOpenChange(false)}>
              Edit Site
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
