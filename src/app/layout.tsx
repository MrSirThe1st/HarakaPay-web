import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Optimize font loading with Next.js font optimization
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevents FOIT (Flash of Invisible Text)
  variable: '--font-inter',
  preload: true,
});

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
    <html lang="fr" className={inter.variable}>
      <body className="antialiased font-sans" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
