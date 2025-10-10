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
    <html lang="fr">
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
