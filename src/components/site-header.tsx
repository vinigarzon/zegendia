"use client";

import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { LinkButton } from "@/components/ui/button";
import type { Locale, NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  locale: Locale;
  nav: NavItem[];
  languageLabel: string;
};

export function SiteHeader({ locale, nav, languageLabel }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-[#040816]/82 backdrop-blur-xl">
      <div className="h-px bg-[linear-gradient(90deg,rgba(228,76,68,0.75),rgba(46,99,107,0.65),rgba(84,156,36,0.65),rgba(61,40,76,0.72))]" />
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Link className="group flex items-center gap-3" href={(locale === "en" ? "/en" : "/") as Route}>
          <div className="relative h-11 w-[146px]">
            <Image
              alt="Zegendia"
              className="object-contain object-left transition duration-300 group-hover:opacity-90"
              fill
              priority
              src="/images/brand/zegendia-logo.png"
            />
          </div>
          <div className="hidden xl:block">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Loyalty + rewards + LATAM</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((item, index) => (
            <Link
              className="group relative text-sm text-slate-300 transition hover:text-white"
              href={item.href as Route}
              key={item.href}
            >
              {item.label}
              <span
                className={cn(
                  "absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full",
                  index % 4 === 0
                    ? "bg-[#e44c44]"
                    : index % 4 === 1
                      ? "bg-[#2e636b]"
                      : index % 4 === 2
                        ? "bg-[#549c24]"
                        : "bg-[#3d284c]"
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher label={languageLabel} locale={locale} />
          <LinkButton href={locale === "en" ? "/en/contact" : "/contact"} size="sm" variant="brandWarm">
            {locale === "en" ? "Talk to us" : "Hablemos"}
          </LinkButton>
        </div>

        <button
          aria-label="Toggle navigation"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-white/6 bg-[#071126] transition-[max-height] duration-300 lg:hidden",
          open ? "max-h-[420px]" : "max-h-0"
        )}
      >
        <div className="container-shell flex flex-col gap-5 py-5">
          {nav.map((item) => (
            <Link
              className="text-base font-medium text-slate-200"
              href={item.href as Route}
              key={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <LanguageSwitcher label={languageLabel} locale={locale} />
            <LinkButton href={locale === "en" ? "/en/contact" : "/contact"} size="sm" variant="brandWarm">
              {locale === "en" ? "Talk to us" : "Hablemos"}
            </LinkButton>
          </div>
        </div>
      </div>
    </header>
  );
}
