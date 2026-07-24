import type { Metadata } from "next";
import localFont from "next/font/local";
import "@fontsource-variable/jost/wght.css";
import { AppFrame } from "@/components/app-shell/app-frame";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/geist-sans.woff2",
  variable: "--font-geist-sans",
  display: "swap",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/geist-mono.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://orbsona.com"),
  title: {
    default: "Orbsona — Living identities for AI agents",
    template: "%s — Orbsona",
  },
  description: "Design, export, and run a recognizable animated identity for your AI agent.",
  applicationName: "Orbsona",
  alternates: {
    canonical: "/",
  },
  keywords: ["AI avatar", "animated avatar", "AI agent", "voice agent", "agent interface", "generative identity"],
  openGraph: {
    type: "website",
    url: "https://orbsona.com",
    siteName: "Orbsona",
    title: "Orbsona — Living identities for AI agents",
    description: "Design, export, and run a recognizable animated identity for your AI agent.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbsona — Living identities for AI agents",
    description: "Design, export, and run a recognizable animated identity for your AI agent.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-background antialiased`}
    >
      <body className="h-full overflow-hidden">
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
