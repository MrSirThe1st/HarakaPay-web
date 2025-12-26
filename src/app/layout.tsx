import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalStructuredData } from "@/components/seo/StructuredDataScripts";
import { HOME_METADATA } from "@/lib/seo/metadata";
import { CookieNotice } from "@/components/shared/CookieNotice";

// Optimize font loading with Next.js font optimization
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevents FOIT (Flash of Invisible Text)
  variable: '--font-inter',
  preload: true,
});

// Enhanced metadata for SEO
export const metadata: Metadata = HOME_METADATA;

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        {/* Favicon and App Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch for Supabase */}
        <link rel="dns-prefetch" href="https://apdeuckmufukrnuffetv.supabase.co" />

        {/* Global Structured Data */}
        <GlobalStructuredData />
      </head>
      <body className="antialiased font-sans" suppressHydrationWarning={true}>
        {children}
        <CookieNotice />
      </body>
    </html>
  );
}
