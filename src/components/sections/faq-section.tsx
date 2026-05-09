"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { getSectionKickerAccentClass, type AccentTone } from "@/lib/theme";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

type FAQItem = {
  question: string;
  answer: string;
};

export function FAQSection({
  eyebrow,
  title,
  items,
  accent = "cyan",
  locale
}: {
  eyebrow: string;
  title: string;
  items: FAQItem[];
  accent?: AccentTone;
  locale: Locale;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const accentDots = ["bg-[#e44c44]", "bg-[#549c24]", "bg-[#2e636b]", "bg-[#3d284c]"];
  const labels =
    locale === "en"
      ? {
          count: "key questions",
          prompt: "Open each question to see the answer below."
        }
      : {
          count: "preguntas clave",
          prompt: "Abre cada pregunta para ver la respuesta justo debajo."
        };

  return (
    <section className="section-space">
      <div className="container-shell">
        <div className={cn("section-kicker", getSectionKickerAccentClass(accent))}>{eyebrow}</div>
        <h2 className="headline-balance max-w-4xl font-display text-4xl font-semibold text-white sm:text-5xl">
          {title}
        </h2>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <div>{labels.prompt}</div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
            {items.length} {labels.count}
          </div>
        </div>
        <div className="relative mt-10 overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,12,28,0.96)_0%,rgba(7,12,28,0.88)_100%)]">
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_bottom,rgba(46,99,107,0.18),transparent_62%)]" />
          <div className="relative divide-y divide-white/8">
            {items.map((item, index) => {
              const active = index === activeIndex;

              return (
                <div className="px-5 py-2 sm:px-7" key={item.question}>
                  <button
                    aria-expanded={active}
                    className="group flex w-full items-start gap-4 py-5 text-left"
                    onClick={() => setActiveIndex(active ? -1 : index)}
                    type="button"
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold transition-colors",
                        active
                          ? "border-[#e44c44]/40 bg-[#e44c44]/16 text-white"
                          : "border-white/10 bg-white/[0.04] text-slate-300 group-hover:border-[#549c24]/30"
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-3">
                        <span className={cn("h-2.5 w-2.5 rounded-full", accentDots[index % accentDots.length])} />
                        <div className="font-display text-lg font-medium leading-7 text-white sm:text-xl sm:leading-8">
                          {item.question}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "mt-2 h-5 w-5 shrink-0 transition-transform",
                        active ? "rotate-180 text-[#e44c44]" : "text-slate-500 group-hover:text-[#549c24]"
                      )}
                    />
                  </button>

                  {active ? (
                    <div className="pb-6 pl-[3.75rem] pr-2">
                      <p className="max-w-4xl text-[15px] leading-7 text-slate-300 sm:text-base">{item.answer}</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
