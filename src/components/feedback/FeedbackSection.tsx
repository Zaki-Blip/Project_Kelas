import Link from "next/link";

import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { Button } from "@/components/ui/Button";
import type { SessionUser } from "@/lib/auth/session";
import { getLoginNextHref } from "@/lib/projects/urls";
import styles from "./FeedbackSection.module.css";

type FeedbackSectionProps = {
  user: SessionUser | null;
  showSuccess?: boolean;
};

export function FeedbackSection({
  user,
  showSuccess = false,
}: FeedbackSectionProps) {
  return (
    <section id="kotak-saran" className={styles.section}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Kotak saran</p>
            <h2 className={styles.title}>Ada masukan untuk KaryaKelas?</h2>
            <p className={styles.text}>
              Ceritakan pengalamanmu memakai situs ini. Saran, kritik, atau
              laporan bug akan membantu kami membuat KaryaKelas lebih nyaman.
            </p>
            <ul className={styles.points}>
              <li>Saran fitur atau konten</li>
              <li>Masukan tampilan dan kemudahan pakai</li>
              <li>Laporan bug atau tautan bermasalah</li>
            </ul>
            <p className={styles.note}>
              Kotak saran hanya bisa dikirim setelah masuk.
            </p>
          </div>

          <div className={styles.formWrap}>
            {user && showSuccess ? (
              <div className={styles.success} role="status">
                <strong>Terima kasih!</strong>
                <p>
                  Tanggapanmu sudah terkirim. Masukanmu membantu KaryaKelas
                  jadi lebih baik.
                </p>
              </div>
            ) : null}

            {user ? (
              <FeedbackForm user={user} />
            ) : (
              <div className={styles.loginCard}>
                <span className={styles.lockIcon} aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    focusable="false"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    <path d="M12 14v3" />
                  </svg>
                </span>
                <h3>Masuk untuk mengirim saran</h3>
                <p>
                  Kami perlu tahu siapa yang mengirim agar tanggapan bisa
                  ditindaklanjuti.
                </p>
                <div>
                  <Button href={getLoginNextHref("/#kotak-saran")}>Masuk</Button>
                </div>
                <p className={styles.loginNote}>
                  Belum punya akun? <Link href="/register">Daftar</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
