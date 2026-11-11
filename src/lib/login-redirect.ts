const DEFAULT_DESTINATION = "/dashboard";

/** Only allow return destinations within the authenticated application. */
export function getLoginRedirect(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    /[\\\u0000-\u0020\u007f]/.test(value)
  ) {
    return DEFAULT_DESTINATION;
  }

  try {
    const base = "https://login.invalid";
    const url = new URL(value, base);
    const pathname = decodeURIComponent(url.pathname);

    if (
      url.origin !== base ||
      /[\\\u0000-\u0020\u007f]/.test(pathname) ||
      !["/dashboard", "/statements"].some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      )
    ) {
      return DEFAULT_DESTINATION;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_DESTINATION;
  }
}
