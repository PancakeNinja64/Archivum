import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Archivum — The record of public AI data",
    template: "%s · Archivum",
  },
  description:
    "Archivum catalogs public AI datasets with one consistent record each — origin, licensing, lineage, and how much of it the source documents.",
  applicationName: "Archivum",
  authors: [{ name: "Archivum LLC" }],
  keywords: ["AI data", "dataset provenance", "data lineage", "documentation coverage", "dataset licensing", "RAG", "Archivum"],
  openGraph: {
    title: "Archivum — The record of public AI data",
    description: "One consistent record per dataset: origin, licensing, lineage, and Documentation Coverage.",
    type: "website",
    locale: "en_US",
    siteName: "Archivum",
  },
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFCFD" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0E14" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="paper-grain flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <Nav />
          <main className="relative z-[1] flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
