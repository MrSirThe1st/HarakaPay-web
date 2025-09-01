'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDualAuth } from '@/hooks/shared/hooks/useDualAuth';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import SchoolSidebar from '@/components/school/layout/SchoolSidebar';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import SchoolTopbar from '@/components/school/layout/SchoolTopbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, profile, loading, canAccessAdminPanel, canAccessSchoolPanel } = useDualAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !profile) {
    router.push('/login');
    return null;
  }

  const renderSidebar = () => {
    if (canAccessAdminPanel) {
      return <AdminSidebar />;
    } else if (canAccessSchoolPanel) {
      return <SchoolSidebar />;
    }
    return null;
  };

  const renderTopbar = () => {
    if (canAccessAdminPanel) {
      return <AdminTopbar />;
    } else if (canAccessSchoolPanel) {
      return <SchoolTopbar />;
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        {renderSidebar()}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        {renderTopbar()}
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
