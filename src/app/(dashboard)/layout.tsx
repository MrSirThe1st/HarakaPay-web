import { DashboardNavigation } from "@/components/navigation/DashboardNavigation";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-base-bg)",
        fontFamily: "var(--font-family-base)",
        color: "var(--color-text-main)",
      }}
    >
      <DashboardNavigation />
      <main
        style={{
          width: "100%",
          minHeight: "calc(100vh - var(--nav-height))",
        }}
      >
        {children}
      </main>
    </div>
  );
}
