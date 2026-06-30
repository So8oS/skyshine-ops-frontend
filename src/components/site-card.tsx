import { Card, CardContent, CardHeader } from "./ui/card";
import { Building2, User, MapPin, Layers } from "lucide-react";
import type { Site } from "@/actions/sites";
import {
  ASSET_TYPE_LABELS,
  ACCESS_CONSTRAINT_LABELS,
  type AssetType,
  type AccessConstraint,
} from "@/actions/sites";
import { cn } from "@/lib/utils";

interface SiteCardProps {
  site: Site;
  variant?: "compact" | "detailed";
  className?: string;
  onClick?: () => void;
}

export function SiteCard({ site, className, onClick }: SiteCardProps) {
  const locationLine = [site.emirate, site.city].filter(Boolean).join(" · ") || "—";
  const assetTypeLabel = site.assetType ? ASSET_TYPE_LABELS[site.assetType as AssetType] : null;
  const constraints = (site.accessConstraints ?? []).slice(0, 3);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer border-border/50 transition-all group",
        "hover:border-cyan-500/30 hover:bg-card/80",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-muted border border-border shrink-0 transition-colors group-hover:border-cyan-500/30 group-hover:bg-cyan-500/5">
            <Building2 className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-cyan-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm leading-tight line-clamp-1">{site.name}</p>
            {site.code && (
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{site.code}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        {site.siteManager && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{site.siteManager}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{locationLine}</span>
        </div>
        {assetTypeLabel && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Layers className="h-3 w-3 shrink-0" />
            <span>{assetTypeLabel}</span>
          </div>
        )}

        {(site.tetherRequired || constraints.length > 0) && (
          <div className="pt-2 flex flex-wrap gap-1.5">
            {site.tetherRequired && (
              <span className="text-xs rounded border border-amber-500/20 bg-amber-500/8 text-amber-400 px-1.5 py-0.5">
                Tether
              </span>
            )}
            {constraints.map((c) => (
              <span
                key={c}
                className="text-xs rounded border border-border bg-muted/50 text-muted-foreground px-1.5 py-0.5"
              >
                {ACCESS_CONSTRAINT_LABELS[c as AccessConstraint]}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
