'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDualAuth } from '@/hooks/shared/hooks/useDualAuth';
import { useTranslation } from '@/hooks/useTranslation';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import SchoolSidebar from '@/components/school/layout/SchoolSidebar';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import SchoolTopbar from '@/components/school/layout/SchoolTopbar';


interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
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



  if (canAccessAdminPanel) {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <AdminTopbar />
          
          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  if (canAccessSchoolPanel) {
    // School panel - use custom sidebar
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <SchoolSidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <SchoolTopbar />
          
          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here with proper auth
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('Access Denied')}</h1>
        <p className="text-gray-600">{t('You don\'t have permission to access this area.')}</p>
      </div>
    </div>
  );
}
