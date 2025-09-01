import React from 'react';
import { DashboardLayout } from '@/navigation';
import { NavigationProvider } from '@/navigation';

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </NavigationProvider>
  );
}
