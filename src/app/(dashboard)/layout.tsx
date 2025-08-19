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
        className="container"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "var(--space-lg)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
