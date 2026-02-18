import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plane, ArrowLeft, Pencil, Calendar } from "lucide-react";
import {
  useDrone,
  dronesApi,
  droneKeys,
  DRONE_STATUS_LABELS,
  type DroneStatus,
} from "@/actions/drones";
import { SCHEDULE_STATUS_LABELS } from "@/actions/schedules";
import type { ScheduleStatus } from "@/actions/schedules";
import { SiteErrorFallback } from "@/components/site-error-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/drones/$droneId/")({
  component: DroneDetailsPage,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: droneKeys.detail(params.droneId),
      queryFn: () => dronesApi.getById(params.droneId),
    });
    return null;
  },
});

function formatScheduleTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function DroneDetailsPage() {
  const { droneId } = Route.useParams();
  const { data: drone, isLoading, error } = useDrone(droneId);

  if (error) {
    return (
      <SiteErrorFallback error={error} title="Failed to load drone" />
    );
  }

  const schedules = drone?.schduals ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/drones">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Plane className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-48 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {drone?.name}
                  </h1>
                  <p className="text-muted-foreground">
                    {drone?.serialNumber}
                    {drone?.status != null && (
                      <span className="ml-2">
                        · {DRONE_STATUS_LABELS[drone.status as DroneStatus]}
                      </span>
                    )}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        {drone && (
          <Link
            to="/dashboard/drones/$droneId/edit"
            params={{ droneId }}
          >
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-48" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : drone ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Drone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{drone.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Serial number</p>
                <p className="font-medium">{drone.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">
                  <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                    {DRONE_STATUS_LABELS[drone.status]}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedules ({schedules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">
                  No schedules for this drone.
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Site</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pilot</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead className="text-right w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="text-muted-foreground">
                            {s.job?.site?.name ?? "—"}
                          </TableCell>
                          <TableCell className="font-medium">
                            <Link
                              to="/dashboard/schedules/$scheduleId"
                              params={{ scheduleId: s.id }}
                              className="hover:underline"
                            >
                              {s.job?.name ?? s.job?.id ?? "—"}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                              {s.status && s.status in SCHEDULE_STATUS_LABELS
                                ? SCHEDULE_STATUS_LABELS[s.status as ScheduleStatus]
                                : s.status ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {s.pilot?.name ?? "—"}
                          </TableCell>
                          <TableCell>{formatScheduleTime(s.startAt)}</TableCell>
                          <TableCell>{formatScheduleTime(s.endAt)}</TableCell>
                          <TableCell className="text-right">
                            <Link
                              to="/dashboard/schedules/$scheduleId"
                              params={{ scheduleId: s.id }}
                            >
                              <Button variant="ghost" size="sm" className="h-8">
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
