'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Lazy load dashboard component for better code splitting
const AdminDashboard = dynamic(() => import('./components/AdminDashboard').then(mod => ({ default: mod.AdminDashboard })), {
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>,
  ssr: false
});

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
