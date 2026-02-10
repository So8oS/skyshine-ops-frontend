import { useCallback } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Search } from "lucide-react";
import {
  EMIRATES,
  ASSET_TYPE_LABELS,
  type AssetType,
} from "@/actions/sites";

interface SiteFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  emirate: string;
  onEmirateChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  assetType: string;
  onAssetTypeChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export function SiteFilters({
  searchTerm,
  onSearchChange,
  emirate,
  onEmirateChange,
  city,
  onCityChange,
  assetType,
  onAssetTypeChange,
  pageSize,
  onPageSizeChange,
  className = "mb-6",
}: SiteFiltersProps) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  const handlePageSizeChange = useCallback(
    (value: string) => {
      onPageSizeChange(Number(value));
    },
    [onPageSizeChange]
  );

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={emirate || "all"} onValueChange={(v) => onEmirateChange(v === "all" ? "" : v)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Emirate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All emirates</SelectItem>
                {EMIRATES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-full md:w-[180px]">
              <Input
                placeholder="City"
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
              />
            </div>
            <Select value={assetType || "all"} onValueChange={(v) => onAssetTypeChange(v === "all" ? "" : v)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Asset type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All asset types</SelectItem>
                {(Object.keys(ASSET_TYPE_LABELS) as AssetType[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {ASSET_TYPE_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-full md:w-[140px]">
              <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
