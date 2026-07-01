import { useFeed, type FeedItemKind } from "@/actions/feed";
import { StatusDot } from "./status-dot";

const kindToVariant: Record<FeedItemKind, "live" | "ok" | "idle" | "warn"> = {
  SCHEDULE_UPDATED:     "live",
  SCHEDULE_CREATED:     "ok",
  SITE_CREATED:         "ok",
  JOB_CREATED:          "ok",
  DRONE_CREATED:        "idle",
  DRONE_STATUS_CHANGED: "warn",
};

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function LiveOpsFeed() {
  const { data, isLoading } = useFeed({ pageSize: 20 });
  const items = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-[3px] bg-muted" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-4 text-center font-mono text-xs text-muted-foreground">
        NO RECENT ACTIVITY
      </p>
    );
  }

  return (
    <div className="space-y-0 divide-y divide-border/50 overflow-y-auto max-h-[340px]">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-0.5 px-2 py-2">
          <div className="flex items-center gap-2">
            <StatusDot variant={kindToVariant[item.kind] ?? "idle"} />
            <span className="font-mono text-[11px] text-muted-foreground w-10 shrink-0">
              {formatTime(item.at)}
            </span>
            <span className="flex-1 truncate text-xs font-medium text-foreground">
              {item.summary}
            </span>
          </div>
          {item.actor && (
            <div className="pl-[1.375rem] font-mono text-[10px] text-muted-foreground">
              ↳ {item.actor.name}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
