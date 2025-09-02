import React from 'react';
import { DashboardLayout } from '@/components/navigation/navigation';

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
