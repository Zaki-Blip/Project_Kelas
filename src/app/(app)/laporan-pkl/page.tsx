import type { Metadata } from "next";

import { PklReportForm } from "@/components/pkl/PklReportForm";
import { requireUser } from "@/lib/auth/guards";
import { cn } from "@/lib/cn";
import { getPklSubmissionForUser } from "@/lib/pkl/queries";
import pageStyles from "../app-pages.module.css";

export const metadata: Metadata = {
  title: "Laporan PKL",
  description:
    "Kumpulkan hasil laporan Praktik Kerja Lapangan dan pantau status tinjauannya.",
  alternates: {
    canonical: "/laporan-pkl",
  },
  robots: {
    index: false,
    follow: false,
  },
};

const notices: Record<string, string> = {
  submitted: "Laporan PKL berhasil dikumpulkan.",
  updated: "Perubahan laporan PKL berhasil disimpan.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PklReportPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireUser("/laporan-pkl");
  const params = await searchParams;
  const noticeKey = firstParam(params.notice);
  const notice = noticeKey ? (notices[noticeKey] ?? null) : null;
  const submission = await getPklSubmissionForUser(session.user.id);

  return (
    <section className={cn("container", pageStyles.page)}>
      <header className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>PKL</p>
        <h1 className={pageStyles.title}>Pengumpulan Laporan PKL</h1>
        <p className={pageStyles.text}>
          Kumpulkan hasil laporan Praktik Kerja Lapangan dalam satu tempat. Isi judul,
          tempat PKL, ringkasan, dan tautan laporan yang dapat dibuka oleh pengelola.
        </p>
      </header>

      <PklReportForm submission={submission} notice={notice} />
    </section>
  );
}
