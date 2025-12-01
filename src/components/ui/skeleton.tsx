// Skeleton Loader Components
// Reusable skeleton loaders for consistent loading states across the application

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base Skeleton component
 * Use this for custom skeleton shapes
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

/**
 * Stat Card Skeleton
 * For dashboard statistics cards
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Table Skeleton
 * For data tables with configurable rows
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true
}: TableSkeletonProps) {
  return (
    <div className="overflow-hidden">
      {showHeader && (
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-6 w-full" />
          ))}
        </div>
      )}
      <div className="space-y-3">
        {[...Array(rows)].map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {[...Array(columns)].map((_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-12 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * List Skeleton
 * For simple list views
 */
interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
}

export function ListSkeleton({ items = 5, showAvatar = true }: ListSkeletonProps) {
  return (
    <div className="space-y-4">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          {showAvatar && <Skeleton className="h-12 w-12 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Card Skeleton
 * For card-based layouts
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
}

/**
 * Form Skeleton
 * For form inputs
 */
interface FormSkeletonProps {
  fields?: number;
}

export function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <div className="space-y-6">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Grid Skeleton
 * For dashboard layouts with stats and content
 */
export function DashboardGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <TableSkeleton rows={8} columns={5} />
      </div>
    </div>
  );
}

/**
 * Text Skeleton
 * For text content
 */
interface TextSkeletonProps {
  lines?: number;
}

export function TextSkeleton({ lines = 3 }: TextSkeletonProps) {
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}
