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
} from "lucide-react";
import type { Site } from "@/actions/sites";
import { useSiteDetails } from "@/actions/sites";
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
  const { data: siteDetails, isLoading } = useSiteDetails(
    open ? site?.id ?? null : null
  );

  const details = siteDetails ?? site;
  const jobsCount = siteDetails?.jobs?.length ?? 0;

  if (!site) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <DialogTitle className="text-xl">{details?.name}</DialogTitle>
              <DialogDescription>Site details and information</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Site Manager */}
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Site Manager</p>
              {isLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <p className="font-medium">{details?.siteManager}</p>
              )}
            </div>
          </div>

          {/* Email */}
          {details?.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                {isLoading ? (
                  <Skeleton className="h-5 w-40" />
                ) : (
                  <p className="font-medium">{details.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Phone */}
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              {isLoading ? (
                <Skeleton className="h-5 w-28" />
              ) : (
                <p className="font-medium">{details?.phone}</p>
              )}
            </div>
          </div>

          {/* Description */}
          {details?.Description && (
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                {isLoading ? (
                  <Skeleton className="h-5 w-full" />
                ) : (
                  <p className="font-medium">{details.Description}</p>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Jobs Count */}
          <div className="flex items-center gap-3">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Jobs</p>
              {isLoading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <p className="font-medium">
                  {jobsCount} {jobsCount === 1 ? "job" : "jobs"} associated
                </p>
              )}
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              {isLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <p className="font-medium">
                  {details?.createdAt
                    ? new Date(details.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
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
