import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(pathname: string) {
  const base = process.env.SITE_URL ?? "https://www.zegendia.com";
  return new URL(pathname, base).toString();
}

export function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

export function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-EC" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
