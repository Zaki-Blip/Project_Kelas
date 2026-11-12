import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/security/urls";
import styles from "../auth-card.module.css";

export const metadata: Metadata = {
  title: "Daftar",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const nextPath = safeNextPath(firstParam(params.next));
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/dashboard");
  }

  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>Akun</p>
      <h1 className={styles.title}>Daftar</h1>
      <p className={styles.text}>
        Buat akun untuk membuka galeri karya, melihat detail proyek, dan mencoba pratinjau.
      </p>
      <RegisterForm nextPath={nextPath} />
    </section>
  );
}
