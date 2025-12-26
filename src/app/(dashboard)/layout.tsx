import React from 'react';
import { DashboardLayout } from '@/components/navigation/navigation';

export const dynamic = 'force-dynamic';

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
