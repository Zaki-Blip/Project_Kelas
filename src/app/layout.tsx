import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

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
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "KaryaKelas — Katalog Karya Kelas",
    template: "%s — KaryaKelas",
  },
  description:
    "Katalog proyek hasil karya siswa: temukan karya, buka detail, dan coba pratinjau langsung.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
        {children}
      </body>
    </html>
  );
}
