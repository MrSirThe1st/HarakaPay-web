// Management Page Skeleton
// Unified skeleton for pages with Stats + Search + Table layout
// Used by: Students, Staff, Payments, Schools pages

import { Skeleton, StatCardSkeleton, TableSkeleton } from "@/components/ui/skeleton";

interface ManagementPageSkeletonProps {
  /** Number of stat cards to show */
  statCards?: number;
  /** Show search bar */
  showSearch?: boolean;
  /** Show filter controls */
  showFilters?: boolean;
  /** Number of table rows */
  tableRows?: number;
  /** Number of table columns */
  tableColumns?: number;
  /** Page title */
  title?: string;
}

export function ManagementPageSkeleton({
  statCards = 4,
  showSearch = true,
  showFilters = true,
  tableRows = 8,
  tableColumns = 5,
  title,
}: ManagementPageSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
      )}

      {/* Stats Cards */}
      {statCards > 0 && (
        <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-${Math.min(statCards, 4)}`}>
          {[...Array(statCards)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {showSearch && (
              <div className="flex-1">
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {showFilters && (
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <Skeleton className="h-6 w-48" />
        </div>
        <TableSkeleton rows={tableRows} columns={tableColumns} />

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
