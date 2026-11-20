const FORMSPREE_HOSTS = new Set(["formspree.io", "www.formspree.io"]);

/**
 * Returns a normalized Formspree endpoint only for the official HTTPS host.
 * The endpoint is configured through FORMSPREE_ENDPOINT so the deployment can
 * paste the URL from the Formspree dashboard without changing application code.
 */
export function getFormspreeEndpoint(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);

    if (
      url.protocol !== "https:" ||
      url.username.length > 0 ||
      url.password.length > 0 ||
      url.port.length > 0 ||
      !FORMSPREE_HOSTS.has(url.hostname.toLowerCase()) ||
      !url.pathname.startsWith("/f/") ||
      url.pathname.length <= 3
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
