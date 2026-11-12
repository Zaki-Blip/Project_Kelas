import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/security/urls";
import styles from "../auth-card.module.css";

export const metadata: Metadata = {
  title: "Masuk",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const nextPath = safeNextPath(firstParam(params.next));
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect(nextPath);
  }

  const notice =
    firstParam(params.registered) === "1"
      ? "Akun berhasil dibuat. Silakan masuk."
      : firstParam(params.expired) === "1"
        ? "Sesi berakhir. Silakan masuk lagi."
        : undefined;

  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>Akun</p>
      <h1 className={styles.title}>Masuk</h1>
      <p className={styles.text}>
        Gunakan akun yang sudah terdaftar untuk membuka galeri karya dan pratinjau proyek.
      </p>
      <LoginForm nextPath={nextPath} notice={notice} />
    </section>
  );
}
