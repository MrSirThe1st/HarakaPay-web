import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HarakaPay - School Fee Management",
  description: "Streamline school fee collection and management",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        suppressHydrationWarning={true}
        style={{
          background: "var(--color-base-bg)",
          color: "var(--color-text-main)",
          fontFamily: "var(--font-family-base)",
          fontSize: "var(--font-size-base)",
          fontWeight: 400,
          margin: 0,
          minHeight: "100vh",
          transition: "background 0.3s, color 0.3s",
        }}
      >
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
