import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function StatCardSkeleton() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export function RecentReceiptSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-2 border-retro-brown/20 rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

// Receipts page specific skeletons
export function ReceiptsStatsCardSkeleton() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ReceiptCardSkeleton() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-3 w-24 mt-1" />
      </CardContent>
    </Card>
  );
}

// Receipt detail page skeletons
export function ReceiptDetailHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-32" />
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-36" />
      </div>
    </div>
  );
}

export function ReceiptImageSkeleton() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="bg-retro-cream/30 rounded-lg p-8 text-center">
          <Skeleton className="w-16 h-16 mx-auto mb-4 rounded" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ReceiptItemsSkeleton() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 border-2 border-retro-brown/20 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ReceiptSidebarSummarySkeleton() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-1 w-full" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-1 w-full" />
        <Skeleton className="h-2 w-full" />
      </CardContent>
    </Card>
  );
}

export function ReceiptSidebarInfoSkeleton() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <Skeleton className="h-6 w-28" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Skeleton className="h-3 w-20 mb-1" />
          <div className="flex items-center space-x-2 mt-1">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-1 w-full" />
        <div>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-1 w-full" />
        <div>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-4 w-44" />
        </div>
      </CardContent>
    </Card>
  );
}

// Groups page skeletons
export function GroupCardSkeleton() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

export function GroupHeaderSkeleton() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 w-full">
      <div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <Skeleton className="h-9 w-32 mt-4 md:mt-0" />
    </div>
  );
}

export function MembersListSkeleton() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <Skeleton className="h-6 w-28" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
