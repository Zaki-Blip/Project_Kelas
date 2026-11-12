import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function wantsTls(searchParams: URLSearchParams): boolean {
  const mode =
    searchParams.get("ssl") ??
    searchParams.get("sslaccept") ??
    searchParams.get("sslmode") ??
    searchParams.get("ssl-mode");

  return mode === "true" || mode === "strict" || mode === "required" || mode === "verify-full";
}

/**
 * Builds the Prisma MariaDB adapter from a single connection string.
 *
 * The MariaDB driver does not understand Prisma's `sslaccept` parameter, so
 * TLS-related query parameters are translated into the driver's `ssl` option.
 * Keep this helper free of `server-only` so the seed script can reuse it.
 */
export function createPrismaAdapter(databaseUrl: string): PrismaMariaDb {
  const url = new URL(databaseUrl);

  if (url.protocol !== "mysql:" && url.protocol !== "mariadb:") {
    throw new Error("DATABASE_URL must use the mysql:// or mariadb:// protocol.");
  }

  const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
  if (!database) {
    throw new Error("DATABASE_URL must include a database name.");
  }

  return new PrismaMariaDb({
    host: url.hostname.replace(/^\[|\]$/g, ""),
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    connectionLimit: 3,
    ssl: wantsTls(url.searchParams) ? { rejectUnauthorized: true } : undefined,
  });
}
