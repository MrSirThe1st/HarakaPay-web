import React from 'react';
import { DashboardLayout, NavigationProvider } from '@/components/navigation/navigation';

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
