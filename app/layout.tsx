import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import SiteHeader from "@/components/site-header";

export const metadata: Metadata = {
  title: "TCG Catalog",
  description: "Trading card catalog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100"
      >
        <ThemeProvider>
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}