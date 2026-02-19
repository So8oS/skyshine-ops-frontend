import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useUser } from "@/actions/auth";
import WeeklyWeatherCalendar from "@/components/weather";
import {
  useStatisticsOverview,
  useJobStats,
} from "@/actions/statistics";
import {
  useSchedules,
  SCHEDULE_STATUS_LABELS,
  type ScheduleStatus,
} from "@/actions/schedules";
import { useJobs, JOB_TYPE_LABELS, type JobType } from "@/actions/jobs";
import { StatsCard } from "@/components/stats-card";
import {
  Building2,
  Briefcase,
  Calendar,
  Plane,
  Users,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Pie,
  PieChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

/* ---------- Chart configs ---------- */

const scheduleStatusConfig = {
  ASSIGNED: { label: "Assigned", color: "#6366f1" },
  IN_PROGRESS: { label: "In Progress", color: "#3b82f6" },
  COMPLETED: { label: "Completed", color: "#64748b" },
  CANCELLED: { label: "Cancelled", color: "#a78bfa" },
} satisfies ChartConfig;

const droneStatusConfig = {
  AVAILABLE: { label: "Available", color: "#3b82f6" },
  MAINTENANCE: { label: "Maintenance", color: "#8b5cf6" },
  OUT_OF_SERVICE: { label: "Out of Service", color: "#475569" },
} satisfies ChartConfig;

const jobTypeConfig = {
  INSPECTION: { label: "Inspection", color: "#6366f1" },
  CLEANING: { label: "Cleaning", color: "#94a3b8" },
} satisfies ChartConfig;

/* ---------- Quick actions ---------- */

const quickActions = [
  { label: "New Site", to: "/dashboard/sites/new" as const, icon: Building2 },
  { label: "New Job", to: "/dashboard/jobs/new" as const, icon: Briefcase },
  { label: "New Schedule", to: "/dashboard/schedules/new" as const, icon: Calendar },
  { label: "New Drone", to: "/dashboard/drones/new" as const, icon: Plane },
];

/* ---------- Helpers ---------- */

function ChartSkeleton() {
  return (
    <div className="flex items-center justify-center h-[220px]">
      <Skeleton className="h-[180px] w-[180px] rounded-full" />
    </div>
  );
}

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={cols} className="py-3">
            <Skeleton className="h-5 w-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatShortDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ---------- Main ---------- */

function DashboardIndex() {
  const { data: user } = useUser();
  const { data: stats, isLoading } = useStatisticsOverview();
  const { data: jobStats, isLoading: jobStatsLoading } = useJobStats();

  const now = useMemo(() => new Date().toISOString(), []);
  const { data: upcomingData, isLoading: upcomingLoading } = useSchedules({
    from: now,
    pageSize: 5,
  });
  const { data: recentJobsData, isLoading: recentJobsLoading } = useJobs({
    pageSize: 5,
  });

  const upcomingSchedules = upcomingData?.items ?? [];
  const recentJobs = recentJobsData?.items ?? [];

  const scheduleChartData = stats
    ? Object.entries(stats.schedulesByStatus).map(([key, value]) => ({
        status: key,
        count: value,
        fill: `var(--color-${key})`,
      }))
    : [];

  const droneChartData = stats
    ? Object.entries(stats.dronesByStatus).map(([key, value]) => ({
        status: key,
        count: value,
        fill: `var(--color-${key})`,
      }))
    : [];

  const jobChartData = jobStats
    ? Object.entries(jobStats.byType).map(([key, value]) => ({
        type: key,
        count: value,
        fill: `var(--color-${key})`,
      }))
    : [];

  const totalSchedulesForChart = scheduleChartData.reduce(
    (sum, d) => sum + d.count,
    0
  );
  const totalDronesForChart = droneChartData.reduce(
    (sum, d) => sum + d.count,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{user?.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your operations.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Link to="/dashboard/sites" className="block">
          <StatsCard
            title="Sites"
            value={stats?.totalSites ?? 0}
            icon={Building2}
            iconColor="text-blue-500"
            isLoading={isLoading}
          />
        </Link>
        <Link to="/dashboard/jobs" className="block">
          <StatsCard
            title="Jobs"
            value={stats?.totalJobs ?? 0}
            icon={Briefcase}
            iconColor="text-green-500"
            isLoading={isLoading}
          />
        </Link>
        <Link to="/dashboard/schedules" className="block">
          <StatsCard
            title="Schedules"
            value={stats?.totalSchedules ?? 0}
            icon={Calendar}
            iconColor="text-purple-500"
            isLoading={isLoading}
          />
        </Link>
        <Link to="/dashboard/drones" className="block">
          <StatsCard
            title="Drones"
            value={stats?.totalDrones ?? 0}
            icon={Plane}
            iconColor="text-orange-500"
            isLoading={isLoading}
          />
        </Link>
        <StatsCard
          title="Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          iconColor="text-cyan-500"
          isLoading={isLoading}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {/* Schedules by status – donut */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Schedules by Status</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {isLoading ? (
              <ChartSkeleton />
            ) : totalSchedulesForChart === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
                No schedules yet
              </div>
            ) : (
              <ChartContainer
                config={scheduleStatusConfig}
                className="mx-auto aspect-square max-h-[280px] w-full [&_.recharts-pie-label-text]:fill-foreground"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={scheduleChartData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius="35%"
                    outerRadius="55%"
                    strokeWidth={3}
                    stroke="hsl(var(--background))"
                  />
                  <ChartLegend
                    content={<ChartLegendContent nameKey="status" />}
                    className="flex-wrap gap-x-3 gap-y-1 justify-center text-xs"
                  />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Drone fleet status – donut */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Drone Fleet Status</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {isLoading ? (
              <ChartSkeleton />
            ) : totalDronesForChart === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
                No drones yet
              </div>
            ) : (
              <ChartContainer
                config={droneStatusConfig}
                className="mx-auto aspect-square max-h-[280px] w-full [&_.recharts-pie-label-text]:fill-foreground"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={droneChartData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius="35%"
                    outerRadius="55%"
                    strokeWidth={3}
                    stroke="hsl(var(--background))"
                  />
                  <ChartLegend
                    content={<ChartLegendContent nameKey="status" />}
                    className="flex-wrap gap-x-3 gap-y-1 justify-center text-xs"
                  />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Jobs by type – bar */}
        <Card className="md:col-span-2 xl:col-span-1 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Jobs by Type</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {jobStatsLoading ? (
              <div className="flex items-center justify-center h-[220px]">
                <Skeleton className="h-[180px] w-full rounded" />
              </div>
            ) : !jobStats || jobStats.total === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
                No jobs yet
              </div>
            ) : (
              <ChartContainer
                config={jobTypeConfig}
                className="mx-auto h-[250px] w-full"
              >
                <BarChart
                  data={jobChartData}
                  layout="vertical"
                  margin={{ left: 0, right: 16 }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="type"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: string) =>
                      jobTypeConfig[v as keyof typeof jobTypeConfig]?.label ?? v
                    }
                    width={80}
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="count" radius={6} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Upcoming Schedules + Recent Jobs ── */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Upcoming Schedules */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Upcoming Schedules</CardTitle>
            <Link to="/dashboard/schedules">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Site</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pilot</TableHead>
                  <TableHead>Start</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingLoading ? (
                  <TableSkeleton cols={5} />
                ) : upcomingSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No upcoming schedules
                    </TableCell>
                  </TableRow>
                ) : (
                  upcomingSchedules.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-muted-foreground truncate max-w-[140px]">
                        {s.job?.site?.name ?? "—"}
                      </TableCell>
                      <TableCell className="font-medium truncate max-w-[140px]">
                        <Link
                          to="/dashboard/schedules/$scheduleId"
                          params={{ scheduleId: s.id }}
                          className="hover:underline"
                        >
                          {s.job?.name ?? s.jobId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                          {SCHEDULE_STATUS_LABELS[s.status as ScheduleStatus] ?? s.status}
                        </span>
                      </TableCell>
                      <TableCell className="truncate max-w-[100px]">
                        {s.pilot?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatShortDateTime(s.startAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Jobs</CardTitle>
            <Link to="/dashboard/jobs">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentJobsLoading ? (
                  <TableSkeleton cols={4} />
                ) : recentJobs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No jobs yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentJobs.map((j) => (
                    <TableRow key={j.id}>
                      <TableCell className="font-medium truncate max-w-[160px]">
                        <Link
                          to="/dashboard/jobs/$jobId/edit"
                          params={{ jobId: j.id }}
                          className="hover:underline"
                        >
                          {j.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[140px]">
                        {j.site?.name ?? j.siteId}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                          {JOB_TYPE_LABELS[j.type as JobType] ?? j.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatShortDate(j.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ── Weather (standalone full-width) ── */}
      <WeeklyWeatherCalendar />

      {/* ── Quick Actions (minimal inline) ── */}
      <div className="flex flex-wrap items-center gap-2">
        {quickActions.map((action) => (
          <Link key={action.to} to={action.to}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
