type EdgeContext = {
  geo?: {
    country?: {
      code?: string;
    };
  };
};

const SPANISH_MARKET_COUNTRIES = new Set([
  "AR",
  "BO",
  "BR",
  "BZ",
  "CL",
  "CO",
  "CR",
  "CU",
  "DO",
  "EC",
  "ES",
  "GT",
  "GY",
  "HN",
  "HT",
  "MX",
  "NI",
  "PA",
  "PE",
  "PR",
  "PY",
  "SV",
  "UY",
  "VE"
]);

const LOCALIZED_STATIC_PATHS = new Set([
  "/",
  "/about",
  "/blog",
  "/case-studies",
  "/contact",
  "/products",
  "/products/oh-my-rewards",
  "/products/puntosplus"
]);

function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]+)`));

  return match ? decodeURIComponent(match[1]) : "";
}

function shouldSkip(pathname: string) {
  return (
    pathname.startsWith("/.netlify/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon-zegendia-mark-v2.png" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-z0-9]+$/i.test(pathname)
  );
}

function getEnglishPath(pathname: string) {
  if (pathname === "/") {
    return "/en";
  }

  return pathname.startsWith("/en") ? pathname : `/en${pathname}`;
}

function getSpanishPath(pathname: string) {
  if (pathname === "/en") {
    return "/";
  }

  return pathname.replace(/^\/en/, "") || "/";
}

export default function localeRouter(request: Request, context: EdgeContext) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return;
  }

  const url = new URL(request.url);
  const { pathname } = url;

  if (shouldSkip(pathname)) {
    return;
  }

  const preferredLocale = getCookieValue(request, "zegendia_locale");

  if (preferredLocale === "en" && LOCALIZED_STATIC_PATHS.has(pathname)) {
    url.pathname = getEnglishPath(pathname);
    return Response.redirect(url, 302);
  }

  if (
    preferredLocale === "es" &&
    pathname.startsWith("/en") &&
    (pathname === "/en" || LOCALIZED_STATIC_PATHS.has(getSpanishPath(pathname)))
  ) {
    url.pathname = getSpanishPath(pathname);
    return Response.redirect(url, 302);
  }

  if (preferredLocale === "en" || preferredLocale === "es" || pathname.startsWith("/en")) {
    return;
  }

  const countryCode = context.geo?.country?.code?.toUpperCase() || "";
  const shouldUseSpanish = SPANISH_MARKET_COUNTRIES.has(countryCode);

  if (!shouldUseSpanish && LOCALIZED_STATIC_PATHS.has(pathname)) {
    url.pathname = getEnglishPath(pathname);
    return Response.redirect(url, 302);
  }
}
