import Link from "next/link";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import styles from "./SiteHeader.module.css";

const publicNavItems = [
  { href: "/", label: "Beranda" },
  { href: "/about", label: "Tentang" },
] as const;

export async function SiteHeader() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  const navItems = [
    ...publicNavItems,
    ...(user
      ? [
          { href: "/dashboard", label: "Galeri" },
          { href: "/laporan-pkl", label: "Laporan PKL" },
        ]
      : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className={styles.header}>
      <div className={cn("container", styles.inner)}>
        <Link href="/" className={styles.brand} aria-label="KaryaKelas, beranda">
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandName}>KaryaKelas</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Navigasi utama">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
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

        <details className={styles.mobileMenu}>
          <summary className={styles.menuButton}>Menu</summary>
          <nav className={styles.mobileNav} aria-label="Navigasi mobile">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={styles.mobileNavLink}>
                {item.label}
              </Link>
            ))}

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
