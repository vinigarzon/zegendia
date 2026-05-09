import Image from "next/image";

import { getSectionKickerAccentClass, type AccentTone } from "@/lib/theme";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

type LatamMapProps = {
  locale: Locale;
  eyebrow: string;
  title: string;
  text: string;
  countries: string[];
  accent?: AccentTone;
};

export function LatamMap({ locale, eyebrow, title, text, countries, accent = "cyan" }: LatamMapProps) {
  const coverageHighlights =
    locale === "en"
      ? [
          "18 LATAM countries",
          "Physical and digital rewards",
          "One regional operating layer"
        ]
      : [
          "18 países LATAM",
          "Premios físicos y digitales",
          "Una sola capa operativa regional"
        ];

  return (
    <section className="section-space">
      <div className="container-shell">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-stretch">
          <div className="flex flex-col lg:min-h-[580px] lg:justify-center">
            <div className={cn("section-kicker", getSectionKickerAccentClass(accent))}>{eyebrow}</div>
            <h2 className="headline-balance font-display text-4xl font-semibold text-white sm:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">{text}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {coverageHighlights.map((item) => (
                <div
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-300"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {countries.map((country, index) => (
                <div
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-100 backdrop-blur-sm"
                  key={country}
                >
                  <span
                    className={cn(
                      "h-2.5 w-2.5 shrink-0 rounded-full",
                      index % 4 === 0 && "bg-[#e44c44]",
                      index % 4 === 1 && "bg-[#549c24]",
                      index % 4 === 2 && "bg-[#2e636b]",
                      index % 4 === 3 && "bg-[#78d5d7]"
                    )}
                  />
                  {country}
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[460px] overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_bottom,#152645_0%,#09111f_42%,#040816_100%)] sm:min-h-[540px] lg:min-h-[580px]">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute -left-10 top-16 h-40 w-40 rounded-full bg-[#2e636b]/20 blur-3xl" />
              <div className="absolute -right-8 bottom-20 h-44 w-44 rounded-full bg-[#3d284c]/24 blur-3xl" />
              <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e44c44]/10 blur-3xl" />
            </div>
            <div className="relative flex min-h-[460px] items-center justify-center p-8 sm:min-h-[540px] sm:p-10 lg:min-h-[580px]">
              <div className="relative aspect-[4/5] h-full min-h-[380px] w-full max-w-[540px] sm:min-h-[500px]">
                <Image
                  alt={locale === "en" ? "LATAM coverage map" : "Mapa de cobertura LATAM"}
                  className="object-contain"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src="/images/sections/latam-map-clean.png"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
