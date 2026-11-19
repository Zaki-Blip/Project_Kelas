import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import { StreamingBoundaryRecovery } from "@/components/layout/StreamingBoundaryRecovery";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

import "@/styles/tokens.css";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: "KaryaKelas — Katalog Karya Kelas",
    template: "%s — KaryaKelas",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Siswa XII RPL 1" }],
  creator: "Siswa XII RPL 1",
  publisher: SITE_NAME,
  referrer: "strict-origin-when-cross-origin",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  keywords: [
    "karya kelas",
    "katalog proyek",
    "portfolio siswa",
    "rpl",
    "smk",
    "web development",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: SITE_NAME,
    title: "KaryaKelas — Katalog Karya Kelas",
    description:
      "Katalog proyek hasil karya siswa XII RPL 1: temukan karya, lihat profil kelas, dan coba pratinjau langsung.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "KaryaKelas — Katalog Karya Kelas",
    description:
      "Katalog proyek hasil karya siswa XII RPL 1: temukan karya, lihat profil kelas, dan coba pratinjau langsung.",
    images: [DEFAULT_OG_IMAGE],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KaryaKelas",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#faf7f0",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${spaceGrotesk.variable} ${dmSans.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <a href="#konten" className="skipLink">
          Lewati ke konten utama
        </a>
        <StreamingBoundaryRecovery />
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
