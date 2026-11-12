"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import styles from "./AdminNav.module.css";

const navItems = [
  {
    href: "/admin",
    label: "Kelola Project",
    isActive: (pathname: string) =>
      pathname === "/admin" || pathname.startsWith("/admin/projects"),
  },
  {
    href: "/admin/categories",
    label: "Kategori",
    isActive: (pathname: string) => pathname.startsWith("/admin/categories"),
  },
  {
    href: "/admin/technologies",
    label: "Teknologi",
    isActive: (pathname: string) => pathname.startsWith("/admin/technologies"),
  },
  {
    href: "/admin/laporan-pkl",
    label: "Laporan PKL",
    isActive: (pathname: string) => pathname.startsWith("/admin/laporan-pkl"),
  },
  {
    href: "/",
    label: "Lihat Situs",
    isActive: () => false,
  },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Navigasi panel pengelola">
      <div className={cn("container", styles.inner)}>
        {navItems.map((item) => {
          const active = item.isActive(pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(styles.link, active && styles.active)}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
