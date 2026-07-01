import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollText, Search } from "lucide-react";
import {
  useFeed,
  feedApi,
  feedKeys,
  FEED_KIND_LABELS,
  type FeedItem,
  type FeedItemKind,
  type FeedListParams,
} from "@/actions/feed";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/status-dot";
import { FeedKindBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 50;

export type LogsSearch = {
  q?: string;
  kind?: string;
  from?: string;
  to?: string;
  page?: number;
};

function parseNumber(val: unknown, defaultVal: number): number {
  if (val === undefined || val === null || val === "") return defaultVal;
  const n = Number(val);
  return Number.isNaN(n) ? defaultVal : Math.max(1, Math.floor(n));
}

export const Route = createFileRoute("/dashboard/logs/")({
  component: LogsPage,
  validateSearch: (search: Record<string, unknown>): LogsSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    kind: typeof search.kind === "string" ? search.kind : undefined,
    from: typeof search.from === "string" ? search.from : undefined,
    to: typeof search.to === "string" ? search.to : undefined,
    page: parseNumber(search.page, 1),
  }),
  loader: async ({ context }) => {
    const defaultParams: FeedListParams = { page: 1, pageSize: PAGE_SIZE };
    context.queryClient.ensureQueryData({
      queryKey: feedKeys.list(defaultParams),
      queryFn: () => feedApi.getAll(defaultParams),
    });
    return null;
  },
});

const FEED_KIND_ORDER = Object.keys(FEED_KIND_LABELS) as FeedItemKind[];

const kindDotVariant: Record<FeedItemKind, "warn" | "ok" | "idle"> = {
  SCHEDULE_UPDATED: "warn",
  SCHEDULE_CREATED: "ok",
  SITE_CREATED: "ok",
  JOB_CREATED: "ok",
  DRONE_CREATED: "idle",
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

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit",
    month: "short",
  })
    .format(new Date(iso))
    .toUpperCase();
}

const logRowClassName = cn(
  "relative flex items-center gap-3 px-4 h-14 border-b border-border last:border-0 transition-colors cursor-pointer",
  "hover:bg-card/60",
  "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary before:opacity-0 hover:before:opacity-100 before:transition-opacity"
);

function LogRowContent({ item }: { item: FeedItem }) {
  return (
    <>
      <div className="flex flex-col items-start justify-center gap-0.5 w-[72px] shrink-0">
        <span className="font-mono text-[11px] font-semibold text-foreground leading-none tabular-nums">
          {formatTime(item.at)}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground leading-none">
          {formatDate(item.at)}
        </span>
      </div>
      <div className="w-px self-stretch bg-border/50 shrink-0" />
      <div className="shrink-0">
        <FeedKindBadge kind={item.kind} label={FEED_KIND_LABELS[item.kind] ?? item.kind} />
      </div>
      <p className="flex-1 min-w-0 truncate text-sm text-foreground">{item.summary}</p>
      <span className="shrink-0 font-mono text-[12px] text-muted-foreground truncate max-w-[120px]">
        {item.actor ? item.actor.name.split(" ")[0] : "—"}
      </span>
    </>
  );
}

function LogRow({ item }: { item: FeedItem }) {
  switch (item.kind) {
    case "SCHEDULE_CREATED":
    case "SCHEDULE_UPDATED":
      return (
        <Link
          to="/dashboard/schedules/$scheduleId"
          params={{ scheduleId: item.refId }}
          className={logRowClassName}
        >
          <LogRowContent item={item} />
        </Link>
      );
    case "SITE_CREATED":
      return (
        <Link
          to="/dashboard/sites/$siteId/edit"
          params={{ siteId: item.refId }}
          className={logRowClassName}
        >
          <LogRowContent item={item} />
        </Link>
      );
    case "JOB_CREATED":
      return (
        <Link
          to="/dashboard/jobs/$jobId/edit"
          params={{ jobId: item.refId }}
          className={logRowClassName}
        >
          <LogRowContent item={item} />
        </Link>
      );
    case "DRONE_CREATED":
    case "DRONE_STATUS_CHANGED":
      return (
        <Link
          to="/dashboard/drones/$droneId"
          params={{ droneId: item.refId }}
          className={logRowClassName}
        >
          <LogRowContent item={item} />
        </Link>
      );
    default:
      return <div className={logRowClassName}><LogRowContent item={item} /></div>;
  }
}

function LogsPage() {
  const navigate = useNavigate({ from: "/dashboard/logs/" });
  const search = Route.useSearch();
  const q = search.q ?? "";
  const kind = search.kind ?? "";
  const from = search.from ?? "";
  const to = search.to ?? "";
  const page = search.page ?? 1;

  const setSearchParams = useCallback(
    (updates: Partial<LogsSearch>) => {
      navigate({
        search: (prev) => {
          const next = { ...prev, ...updates };
          if (next.page === 1) delete next.page;
          if (!next.q) delete next.q;
          if (!next.kind) delete next.kind;
          if (!next.from) delete next.from;
          if (!next.to) delete next.to;
          return next;
        },
        replace: true,
      });
    },
    [navigate]
  );

  // Local input state so typing doesn't hit the router/query on every
  // keystroke — synced back to the URL search param after 300ms of silence.
  const [qInput, setQInput] = useState(q);

  useEffect(() => {
    setQInput(q);
  }, [q]);

  useEffect(() => {
    if (qInput === q) return;
    const handle = setTimeout(() => {
      setSearchParams({ q: qInput || undefined, page: 1 });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput]);

  const params = useMemo<FeedListParams>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      kind: (kind || undefined) as FeedItemKind | undefined,
      from: from || undefined,
      to: to || undefined,
      q: q || undefined,
    }),
    [page, kind, from, to, q]
  );

  const { data, isLoading, error, refetch } = useFeed(params);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const setPage = (p: number) => setSearchParams({ page: p });

  const hasFilters = !!q || !!kind || !!from || !!to;
  const clearFilters = () =>
    setSearchParams({ q: undefined, kind: undefined, from: undefined, to: undefined, page: 1 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Logs</h1>
        <p className="text-muted-foreground">Full activity log · {total} events</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col md:flex-row gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
              <Input
                placeholder="Search logs..."
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                className="pl-9 focus-visible:ring-primary/50"
              />
            </div>
            <Select
              value={kind || "all"}
              onValueChange={(v) =>
                setSearchParams({ kind: v === "all" ? undefined : v, page: 1 })
              }
            >
              <SelectTrigger className="w-full md:w-[190px]">
                <SelectValue placeholder="All kinds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <StatusDot variant="idle" />
                    All kinds
                  </span>
                </SelectItem>
                {FEED_KIND_ORDER.map((k) => (
                  <SelectItem key={k} value={k}>
                    <span className="flex items-center gap-2">
                      <StatusDot variant={kindDotVariant[k]} />
                      {FEED_KIND_LABELS[k]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={from}
              onChange={(e) => setSearchParams({ from: e.target.value || undefined, page: 1 })}
              style={{ colorScheme: "dark" }}
              className="w-full md:w-[150px]"
            />
            <Input
              type="date"
              value={to}
              onChange={(e) => setSearchParams({ to: e.target.value || undefined, page: 1 })}
              style={{ colorScheme: "dark" }}
              className="w-full md:w-[150px]"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="shrink-0"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="flex items-center justify-center gap-2 py-12 font-mono text-xs text-muted-foreground">
          FAILED TO LOAD LOGS ·{" "}
          <button
            onClick={() => refetch()}
            className="text-primary hover:underline uppercase"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Dense log list */}
          <div>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse bg-muted border-b border-border last:border-0"
                />
              ))
            ) : items.length === 0 ? null : (
              items.map((item) => <LogRow key={item.id} item={item} />)
            )}
          </div>

          {!isLoading && items.length === 0 && (
            <EmptyState
              icon={ScrollText}
              title="No activity yet"
              description="Events will appear here as the team uses the system."
            />
          )}

          {!isLoading && items.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
              >
                ← Prev
              </Button>
              <p className="font-mono text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
