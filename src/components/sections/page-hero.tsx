import { getSectionKickerAccentClass, type AccentTone } from "@/lib/theme";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  text: string;
  badge?: string;
  accent?: AccentTone;
};

export function PageHero({ eyebrow, title, text, badge, accent = "cyan" }: PageHeroProps) {
  return (
    <section className="section-space pb-14">
      <div className="container-shell">
        <div className="max-w-4xl">
          <div className={cn("section-kicker", getSectionKickerAccentClass(accent))}>{eyebrow}</div>
          {badge ? <Badge className="mb-4">{badge}</Badge> : null}
          <h1 className="headline-balance font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">{text}</p>
        </div>
      </div>
    </section>
  );
}
