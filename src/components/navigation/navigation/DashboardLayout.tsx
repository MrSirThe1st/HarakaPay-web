'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDualAuth } from '@/hooks/shared/hooks/useDualAuth';
import { useTranslation } from '@/hooks/useTranslation';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import SchoolSidebar from '@/components/school/layout/SchoolSidebar';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import SchoolTopbar from '@/components/school/layout/SchoolTopbar';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const { user, profile, loading, canAccessAdminPanel, canAccessSchoolPanel } = useDualAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.push('/login');
    }
  }, [loading, user, profile, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }



  if (canAccessAdminPanel) {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg text-gray-700 hover:bg-gray-50"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Desktop: always visible, Mobile: slide-in overlay */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <AdminSidebar onNavigate={() => setMobileMenuOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <AdminTopbar />

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  if (canAccessSchoolPanel) {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg text-gray-700 hover:bg-gray-50"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Desktop: always visible, Mobile: slide-in overlay */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <SchoolSidebar onNavigate={() => setMobileMenuOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <SchoolTopbar />

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
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
