import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Mail, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import {
  useSites,
  useSiteCount,
  sitesApi,
  siteKeys,
  type SiteListParams,
  type Site,
} from "@/actions/sites";
import { SiteCardSkeleton } from "@/components/site-skeletons";
import { StatsCard } from "@/components/stats-card";
import { SiteFilters } from "@/components/site-filters";
import { SiteCard } from "@/components/site-card";
import { EmptyState } from "@/components/empty-state";
import { SiteErrorFallback } from "@/components/site-error-fallback";

export const Route = createFileRoute("/dashboard/sites/")({
  component: SitesPage,
  loader: async ({ context }) => {
    const defaultParams: SiteListParams = { page: 1, pageSize: 20 };
    context.queryClient.ensureQueryData({
      queryKey: siteKeys.list(defaultParams),
      queryFn: () => sitesApi.getAll(defaultParams),
    });
    return null;
  },
});

function SitesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Memoize params to keep queryKey stable
  const params = useMemo<SiteListParams>(
    () => ({
      page,
      pageSize,
      q: searchTerm || undefined,
    }),
    [page, pageSize, searchTerm]
  );

  const { data, isLoading, error } = useSites(params);
  const { data: countData, isLoading: isCountLoading } = useSiteCount();

  const sites = data?.items ?? [];
  const totalSites = countData?.siteCount ?? data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;


  const handleSiteClick = (site: Site) => {
    setSelectedSite(site);
    setDialogOpen(true);
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  // Reset to page 1 when page size changes
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  if (error) {
    return <SiteErrorFallback error={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Building2 className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sites</h1>
            <p className="text-muted-foreground">
              Manage your operation sites
            </p>
          </div>
        </div>
        <Link to="/dashboard/sites/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Site
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          title="Total Sites"
          value={totalSites}
          icon={Building2}
          iconColor="text-blue-500"
          isLoading={isCountLoading}
        />
    
      </div>

      {/* Filters */}
      <SiteFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Sites Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <SiteCardSkeleton key={index} />
            ))
          : sites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onClick={() => handleSiteClick(site)}
              />
            ))}
      </div>

      {/* Site Details Dialog */}
      <SiteDetailsDialog
        site={selectedSite}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {/* Empty State */}
      {!isLoading && sites.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No sites found"
          description={
            searchTerm
              ? "Try adjusting your search term"
              : "Start by adding your first site"
          }
          action={
            !searchTerm
              ? {
                  label: "Add Your First Site",
                  to: "/dashboard/sites/new",
                }
              : undefined
          }
        />
      )}

      {/* Pagination */}
      {!isLoading && sites.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({data?.total ?? 0} total sites)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Loading indicator for page changes */}
      {isLoading && sites.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
