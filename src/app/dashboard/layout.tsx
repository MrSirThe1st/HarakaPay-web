// src/app/dashboard/layout.tsx
import LayoutFactory from "@/shared/layout/LayoutFactory";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutFactory>
      {children}
    </LayoutFactory>
  );
}
