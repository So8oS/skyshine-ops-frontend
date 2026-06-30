import type { Site } from "@/actions/sites";
import {
  ASSET_TYPE_LABELS,
  ACCESS_CONSTRAINT_LABELS,
  type AssetType,
  type AccessConstraint,
} from "@/actions/sites";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { StatusDot } from "./status-dot";

interface SiteCardProps {
  site: Site;
  className?: string;
  onClick?: () => void;
}

function specLine(site: Site): string | null {
  const parts: string[] = [];
  if (site.glassSurfaceType) {
    const label = ASSET_TYPE_LABELS[site.glassSurfaceType as AssetType];
    parts.push(label ?? site.glassSurfaceType);
  }
  if (site.estimatedTime != null) parts.push(`${site.estimatedTime} min`);
  if (site.maxApprovedPressure != null) parts.push(`${site.maxApprovedPressure} PSI`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function formatUpdated(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  }).toUpperCase();
}

export function SiteCard({ site, className, onClick }: SiteCardProps) {
  const locationLine = [site.emirate, site.city].filter(Boolean).join(" · ") || null;
  const assetTypeLabel = site.assetType ? ASSET_TYPE_LABELS[site.assetType as AssetType] : null;
  const constraints = site.accessConstraints ?? [];
  const specs = specLine(site);
  const updatedLabel = site.updatedAt ? formatUpdated(site.updatedAt) : null;

  const allConstraintChips: string[] = [];
  if (site.tetherRequired) allConstraintChips.push("Tether");
  constraints.forEach((c) => {
    allConstraintChips.push(ACCESS_CONSTRAINT_LABELS[c as AccessConstraint]);
  });

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative cursor-pointer rounded-[6px] border border-border bg-card p-4 flex flex-col gap-2",
        "transition-all duration-150",
        "hover:border-primary/40 hover:-translate-y-px hover:bg-card/90",
        className
      )}
    >
      {/* Top row: status dot + code */}
      <div className="flex items-center gap-2">
        <StatusDot variant="ok" />
        {site.code && (
          <span className="font-mono text-[11px] text-muted-foreground tracking-wider">
            {site.code}
          </span>
        )}
      </div>

      {/* Site name */}
      <div>
        <p className="font-display font-semibold text-base leading-tight">{site.name}</p>
        {site.siteManager && (
          <p className="text-xs text-muted-foreground mt-0.5">↳ {site.siteManager}</p>
        )}
      </div>

      {/* Location */}
      {locationLine && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{locationLine}</span>
        </div>
      )}

      {/* Asset type + specs */}
      <div className="space-y-0.5">
        {assetTypeLabel && (
          <p className="text-xs text-muted-foreground">{assetTypeLabel}</p>
        )}
        {specs && (
          <p className="font-mono text-[11px] text-muted-foreground/80">{specs}</p>
        )}
      </div>

      {/* Constraint chips */}
      {allConstraintChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allConstraintChips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center rounded-[3px] border border-primary/15 bg-primary/8 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary/90"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      {updatedLabel && (
        <div className="mt-auto pt-2 border-t border-border/50">
          <p className="font-mono text-[9px] text-muted-foreground/50 tracking-wider">
            UPDATED {updatedLabel}
          </p>
        </div>
      )}
    </div>
  );
}
