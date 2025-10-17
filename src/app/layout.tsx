// AI INSTRUCTION: Build a premium, production-ready React + Supabase course-selling website with Admin Dashboard, Student Dashboard, and PWA support. Ensure high performance, bug-free modular architecture, responsive design, and top-tier visuals like Apple or Notion. Optimize for installability, offline support, and real-world deployment quality.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ClientShell } from "@/components/layout/client-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CourseCraft – Premium React + Supabase Courses",
    template: "%s | CourseCraft",
  },
  description:
    "Build, manage, and sell cinematic courses with Supabase infrastructure, buttery animations, and offline-ready PWA experiences.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://coursecraft.example.com"),
  openGraph: {
    title: "CourseCraft – Premium React + Supabase Courses",
    description:
      "A production-ready Next.js + Supabase platform for selling immersive courses with admin and student dashboards.",
    type: "website",
    url: "https://coursecraft.example.com",
    images: [
      {
        url: "https://coursecraft.example.com/og-cover.png",
        width: 1200,
        height: 630,
        alt: "CourseCraft hero preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CourseCraft – Premium React + Supabase Courses",
    description:
      "Launch a smooth, offline-ready course platform powered by Supabase, Tailwind, and Framer Motion.",
    images: ["https://coursecraft.example.com/og-cover.png"],
  },
  appleWebApp: {
    capable: true,
    title: "CourseCraft",
    statusBarStyle: "black-translucent",
  },
  category: "education",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <AppProviders>
          <ClientShell>
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-4 pb-16 pt-8 sm:px-8">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ClientShell>
        </AppProviders>
      </body>
    </html>
  );
}
