export const SESSION_COOKIE_NAME_PRODUCTION = "__Host-kk_session";
export const SESSION_COOKIE_NAME_DEVELOPMENT = "kk_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getSessionCookieName(): string {
  return isProduction() ? SESSION_COOKIE_NAME_PRODUCTION : SESSION_COOKIE_NAME_DEVELOPMENT;
}
