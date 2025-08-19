import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";
import { translations } from "@/lib/loadTranslations";

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
      <body className="antialiased" suppressHydrationWarning={true}>
        <I18nProvider translations={translations}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
