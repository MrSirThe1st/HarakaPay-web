'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDualAuth } from '@/shared/hooks/useDualAuth';

export default function RootPage() {
  const { user, profile, loading, canAccessAdminPanel, canAccessSchoolPanel } = useDualAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && profile) {
        // Redirect based on panel access (your existing logic)
        if (canAccessAdminPanel) {
          router.push('/admin/dashboard');
        } else if (canAccessSchoolPanel) {
          router.push('/school/dashboard');
        } else {
          // Fallback to admin dashboard for unknown roles
          router.push('/admin/dashboard');
        }
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    }
  }, [user, profile, loading, canAccessAdminPanel, canAccessSchoolPanel, router]);

  // Show loading while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
