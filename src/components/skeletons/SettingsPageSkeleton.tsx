// Settings Page Skeleton
// Skeleton loader for settings pages with multiple sections

import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export function SettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* School Information Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Skeleton className="h-6 w-6 rounded-full mr-3" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>

          {/* Logo Section */}
          <div className="mb-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-24 w-24 rounded-lg" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Academic Years Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Skeleton className="h-6 w-6 rounded-full mr-3" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>

          {/* Academic Year Cards */}
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Settings Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Skeleton className="h-6 w-6 rounded-full mr-3" />
            <Skeleton className="h-6 w-48" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
