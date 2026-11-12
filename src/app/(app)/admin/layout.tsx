import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth/guards";
import styles from "./admin-layout.module.css";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "/admin";

  await requireAdmin(pathname);

  return (
    <div className={styles.shell}>
      <AdminNav />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
