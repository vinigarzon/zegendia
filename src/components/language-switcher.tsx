"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/lib/types";

function getAlternatePath(pathname: string, locale: Locale) {
  if (locale === "es") {
    if (pathname === "/en") {
      return "/";
    }

    if (pathname.startsWith("/en/")) {
      return pathname.replace(/^\/en/, "") || "/";
    }

    return pathname;
  }

  if (pathname === "/") {
    return "/en";
  }

  return pathname.startsWith("/en") ? pathname : `/en${pathname}`;
}

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
};

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const pathname = usePathname() || "/";

  return (
    <Link
      className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 hover:bg-white/10"
      href={getAlternatePath(pathname, locale === "es" ? "en" : "es") as Route}
    >
      {label}
    </Link>
  );
}
