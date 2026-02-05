import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Building2, User, Mail, Phone, Calendar } from "lucide-react";
import type { Site } from "@/actions/sites";
import { cn } from "@/lib/utils";

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
            {site.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
