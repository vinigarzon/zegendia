"use client";

import { useMemo, useState } from "react";

import { getSectionKickerAccentClass, type AccentTone } from "@/lib/theme";
import type { AudienceKey } from "@/lib/types";
import { cn } from "@/lib/utils";

type SelectorOption = {
  label: string;
  recommendedProduct: string;
  explanation: string;
};

type InteractiveSelectorProps = {
  eyebrow: string;
  title: string;
  description: string;
  options: Record<AudienceKey, SelectorOption>;
  accent?: AccentTone;
};

export function InteractiveSelector({
  eyebrow,
  title,
  description,
  options,
  accent = "cyan"
}: InteractiveSelectorProps) {
  const [selected, setSelected] = useState<AudienceKey>("customers");
  const active = useMemo(() => options[selected], [options, selected]);
  const optionDots = ["bg-[#e44c44]", "bg-[#549c24]", "bg-[#2e636b]", "bg-[#3d284c]"];

  return (
    <section className="section-space">
      <div className="container-shell">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className={cn("section-kicker", getSectionKickerAccentClass(accent))}>{eyebrow}</div>
            <h2 className="headline-balance font-display text-4xl font-semibold text-white sm:text-5xl">
              {title}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">{description}</p>
          </div>

          <div className="grid gap-5 rounded-[32px] border border-white/10 bg-white/4 p-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-2">
              {(Object.entries(options) as [AudienceKey, SelectorOption][]).map(([key, option], index) => (
                <button
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left transition-all",
                    selected === key
                      ? "border-cyan-300/50 bg-cyan-300/12 text-white shadow-cyan"
                      : "border-white/8 bg-white/4 text-slate-300 hover:bg-white/7"
                  )}
                  key={key}
                  onClick={() => setSelected(key)}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <span className={cn("h-2.5 w-2.5 rounded-full", optionDots[index % optionDots.length])} />
                    <span>{option.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="glass-panel p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-cyan-200">Ruta recomendada</div>
              <div className="mt-3 font-display text-3xl font-semibold text-white">
                {active.recommendedProduct}
              </div>
              <p className="mt-4 text-base leading-8 text-slate-300">{active.explanation}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
