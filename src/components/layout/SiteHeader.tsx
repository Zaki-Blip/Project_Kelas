import Link from "next/link";
import { headers } from "next/headers";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import styles from "./SiteHeader.module.css";

type NavItem = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
};

const publicNavItems: NavItem[] = [
  {
    href: "/",
    label: "Beranda",
    isActive: (pathname) => pathname === "/",
  },
  {
    href: "/about",
    label: "Tentang",
    isActive: (pathname) => pathname === "/about",
  },
];

export async function SiteHeader() {
  const [user, headerStore] = await Promise.all([getCurrentUser(), headers()]);
  const isAdmin = user?.role === "ADMIN";
  const pathname = (headerStore.get("x-pathname") ?? "/").split(/[?#]/)[0] ?? "/";
  const navItems: NavItem[] = [
    ...publicNavItems,
    ...(user
      ? [
          {
            href: "/dashboard",
            label: "Galeri",
            isActive: (path: string) =>
              path === "/dashboard" ||
              path.startsWith("/dashboard/") ||
              path === "/projects" ||
              path.startsWith("/projects/"),
          },
          {
            href: "/profil-kelas",
            label: "Profil Kelas",
            isActive: (path: string) =>
              path === "/profil-kelas" || path.startsWith("/profil-kelas/"),
          },
          {
            href: "/laporan-pkl",
            label: "Laporan PKL",
            isActive: (path: string) =>
              path === "/laporan-pkl" || path.startsWith("/laporan-pkl/"),
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "Admin",
            isActive: (path: string) =>
              path === "/admin" || path.startsWith("/admin/"),
          },
        ]
      : []),
  ];

  return (
    <header className={styles.header}>
      <div className={cn("container", styles.inner)}>
        <Link href="/" className={styles.brand} aria-label="KaryaKelas, beranda">
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandName}>KaryaKelas</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Navigasi utama">
          {navItems.map((item) => {
            const active = item.isActive(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navLink}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.desktopActions}>
          {user ? (
            <>
              <span className={styles.userName} title={user.fullName}>
                {user.fullName}
              </span>
              <LogoutButton variant="ghost" />
            </>
          ) : (
            <>
              <Link href="/login" className={styles.loginLink}>
                Masuk
              </Link>
              <Button href="/register">Daftar</Button>
            </>
          )}
        </div>

        <details className={styles.mobileMenu} suppressHydrationWarning>
          <summary className={styles.menuButton}>Menu</summary>
          <nav className={styles.mobileNav} aria-label="Navigasi mobile">
            {navItems.map((item) => {
              const active = item.isActive(pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.mobileNavLink}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}

            {user ? (
              <>
                <p className={styles.mobileUser}>
                  Masuk sebagai <strong>{user.fullName}</strong>
                </p>
                <div className={styles.mobileLogout}>
                  <LogoutButton fullWidth variant="outline" />
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.mobileNavLink}>
                  Masuk
                </Link>
                <Link href="/register" className={styles.mobileRegister}>
                  Daftar
                </Link>
              </>
            )}
          </nav>
        </details>
      </div>
    </header>
  );
}
