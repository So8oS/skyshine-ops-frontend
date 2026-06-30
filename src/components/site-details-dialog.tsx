import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
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
  Gauge,
  Ruler,
  Clock,
  Anchor,
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
        {title}
      </p>
      {children}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/40 border border-border/50 p-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
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
  const createdLabel = site.createdAt
    ? new Date(site.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto p-0">
        {/* Visually hidden accessible description */}
        <DialogDescription className="sr-only">Site details and information</DialogDescription>

        {/* Header */}
        <div className="p-6 border-b border-border/60">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/15 shrink-0">
              <Building2 className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg leading-tight">
                {site.name}
              </DialogTitle>
              {site.code && (
                <p className="text-xs font-mono text-muted-foreground mt-0.5">{site.code}</p>
              )}
              {locationLine && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {locationLine}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact */}
          <Section title="Contact">
            <div className="space-y-2.5">
              <InfoRow icon={User} label="Site Manager" value={site.siteManager} />
              <InfoRow icon={Mail} label="Email" value={site.email} />
              <InfoRow icon={Phone} label="Phone" value={site.phone} />
              <InfoRow icon={FileText} label="Description" value={site.Description} />
            </div>
          </Section>

          {/* Asset Profile */}
          <Section title="Asset Profile">
            <div className="grid grid-cols-2 gap-2">
              {assetTypeLabel && <StatBox label="Asset Type" value={assetTypeLabel} />}
              {glassLabel && <StatBox label="Glass / Surface" value={glassLabel} />}
              <StatBox
                label="Tether Required"
                value={site.tetherRequired ? "Yes" : "No"}
              />
              {site.maxApprovedPressure != null && (
                <StatBox
                  label="Max Pressure"
                  value={
                    <span className="flex items-center gap-1">
                      <Gauge className="h-3 w-3 text-muted-foreground" />
                      {site.maxApprovedPressure} PSI
                    </span>
                  }
                />
              )}
              {site.height != null && (
                <StatBox
                  label="Height"
                  value={
                    <span className="flex items-center gap-1">
                      <Ruler className="h-3 w-3 text-muted-foreground" />
                      {site.height} m
                    </span>
                  }
                />
              )}
              {site.estimatedTime != null && (
                <StatBox
                  label="Est. Time"
                  value={
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {site.estimatedTime} min
                    </span>
                  }
                />
              )}
            </div>
            {constraints.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Anchor className="h-3 w-3" /> Access Constraints
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {constraints.map((c) => (
                    <span
                      key={c}
                      className="text-xs rounded border border-border/60 bg-muted/50 text-muted-foreground px-2 py-0.5"
                    >
                      {ACCESS_CONSTRAINT_LABELS[c as AccessConstraint]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Operations */}
          <Section title="Operations">
            <div className="grid grid-cols-2 gap-2">
              <StatBox
                label="Associated Jobs"
                value={
                  isLoadingJobsCount ? (
                    <Skeleton className="h-5 w-12" />
                  ) : (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3 text-muted-foreground" />
                      {jobsCount} {jobsCount === 1 ? "job" : "jobs"}
                    </span>
                  )
                }
              />
              {createdLabel && (
                <StatBox
                  label="Created"
                  value={
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {createdLabel}
                    </span>
                  }
                />
              )}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Link to="/dashboard/sites/$siteId/edit" params={{ siteId: site.id }}>
            <Button size="sm" onClick={() => onOpenChange(false)}>
              <Pencil className="h-3.5 w-3.5" />
              Edit Site
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
