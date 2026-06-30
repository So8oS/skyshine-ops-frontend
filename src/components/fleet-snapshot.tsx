import { Link } from "@tanstack/react-router";
import { useStatisticsOverview } from "@/actions/statistics";
import { cn } from "@/lib/utils";

interface CellProps {
  label: string;
  value: number | undefined;
  sub?: string;
  to?: string;
}

function Cell({ label, value, sub, to }: CellProps) {
  const inner = (
    <div className="flex flex-col items-start gap-0.5 px-5 py-3 group">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="font-display text-3xl font-bold tabular-nums text-foreground group-hover:text-primary transition-colors">
        {value ?? "—"}
      </span>
      {sub && (
        <span className="font-mono text-[10px] text-muted-foreground/70">{sub}</span>
      )}
    </div>
  );

  if (to) {
    return <Link to={to} className="block">{inner}</Link>;
  }
  return inner;
}

export function FleetSnapshot() {
  const { data: stats, isLoading } = useStatisticsOverview();

  const available = stats?.dronesByStatus?.AVAILABLE ?? 0;
  const totalDrones = stats?.totalDrones ?? 0;
  const inProgress = stats?.schedulesByStatus?.IN_PROGRESS ?? 0;

  const cells: CellProps[] = [
    {
      label: "Sites",
      value: isLoading ? undefined : stats?.totalSites,
      to: "/dashboard/sites",
    },
    {
      label: "Jobs",
      value: isLoading ? undefined : stats?.totalJobs,
      to: "/dashboard/jobs",
    },
    {
      label: "Schedules",
      value: isLoading ? undefined : stats?.totalSchedules,
      sub: isLoading ? undefined : inProgress > 0 ? `${inProgress} active now` : undefined,
      to: "/dashboard/schedules",
    },
    {
      label: "Drones",
      value: isLoading ? undefined : totalDrones,
      sub: isLoading ? undefined : `${available}/${totalDrones} ready`,
      to: "/dashboard/drones",
    },
    {
      label: "Users",
      value: isLoading ? undefined : stats?.totalUsers,
    },
  ];

  return (
    <div className="flex divide-x divide-border overflow-hidden rounded-[6px] border border-border bg-card">
      {cells.map((cell, i) => (
        <div key={cell.label} className={cn("flex-1 min-w-0", i === 0 && "")}>
          <Cell {...cell} />
        </div>
      ))}
    </div>
  );
}
