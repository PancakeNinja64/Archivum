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
    default: "Archivum — The trust layer for AI data",
    template: "%s · Archivum",
  },
  description:
    "Archivum indexes datasets from across the internet and grades every one — origin, licensing, lineage, and a trust score out of 100.",
  applicationName: "Archivum",
  authors: [{ name: "Archivum LLC" }],
  keywords: ["AI data", "dataset provenance", "data lineage", "trust score", "dataset licensing", "RAG", "Archivum"],
  openGraph: {
    title: "Archivum — The trust layer for AI data",
    description: "Every dataset gets a report card: origin, licensing, lineage, and a trust score out of 100.",
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
