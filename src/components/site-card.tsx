import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Building2, User, Mail, Phone, Calendar, MapPin, Layers } from "lucide-react";
import type { Site } from "@/actions/sites";
import {
  ASSET_TYPE_LABELS,
  GLASS_SURFACE_TYPE_LABELS,
  ACCESS_CONSTRAINT_LABELS,
  type AssetType,
  type GlassSurfaceType,
  type AccessConstraint,
} from "@/actions/sites";
import { cn } from "@/lib/utils";

function formatVal<T>(v: T | undefined | null, label?: (x: T) => string): string {
  if (v === undefined || v === null) return "—";
  if (label) return label(v);
  return String(v);
}

interface SiteCardProps {
  site: Site;
  variant?: "compact" | "detailed";
  className?: string;
  onClick?: () => void;
}

export function SiteCard({
  site,
  variant = "detailed",
  className,
  onClick,
}: SiteCardProps) {
  const isCompact = variant === "compact";
  const locationLine = [site.emirate, site.city].filter(Boolean).join(" / ") || "—";
  const assetTypeLabel = site.assetType ? ASSET_TYPE_LABELS[site.assetType as AssetType] : "—";
  const glassLabel = site.glassSurfaceType
    ? GLASS_SURFACE_TYPE_LABELS[site.glassSurfaceType as GlassSurfaceType]
    : "—";
  const panelDims =
    site.panelWidth != null && site.panelHeight != null
      ? `${site.panelWidth}×${site.panelHeight}`
      : "—";
  const timeLine =
    site.estimatedTime != null || site.actualTime != null
      ? `${formatVal(site.estimatedTime)} / ${formatVal(site.actualTime)} min`
      : "—";
  const constraints = site.accessConstraints ?? [];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "hover:shadow-lg transition-all cursor-pointer hover:border-primary/50",
        className
      )}
    >
      <CardHeader className={cn("pb-3", isCompact && "pb-2")}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle
                className={cn(
                  "line-clamp-1",
                  isCompact ? "text-base" : "text-lg"
                )}
              >
                {site.name}
                {site.code ? (
                  <span className="text-muted-foreground font-normal ml-1">
                    ({site.code})
                  </span>
                ) : null}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {site.siteManager}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn(isCompact && "pt-0")}>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{locationLine}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="w-4 h-4 shrink-0" />
            <span>{assetTypeLabel}</span>
          </div>
          {glassLabel !== "—" && (
            <div className="text-sm text-muted-foreground">
              Glass: {glassLabel}
            </div>
          )}
          {(site.maxApprovedPressure != null || site.height != null || panelDims !== "—") && (
            <div className="text-xs text-muted-foreground space-y-0.5">
              {site.maxApprovedPressure != null && (
                <span>Pressure: {site.maxApprovedPressure} PSI</span>
              )}
              {site.height != null && (
                <span className="ml-2">H: {site.height}m</span>
              )}
              {panelDims !== "—" && (
                <span className="ml-2">Panel: {panelDims}</span>
              )}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            Tether: {site.tetherRequired ? "Yes" : "No"}
          </div>
          {timeLine !== "— / — min" && (
            <div className="text-xs text-muted-foreground">
              Est/Actual: {timeLine}
            </div>
          )}
          {constraints.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {constraints.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {ACCESS_CONSTRAINT_LABELS[c as AccessConstraint]}
                </span>
              ))}
            </div>
          )}
          {site.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1 border-t">
              <Mail className="w-4 h-4" />
              <span className="truncate">{site.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{site.phone}</span>
          </div>
          {!isCompact && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
              <Calendar className="w-3 h-3" />
              <span>Created {new Date(site.createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
