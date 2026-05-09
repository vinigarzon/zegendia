import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CaseStudyCardProps = {
  title: string;
  summary: string;
  tag: string;
  href: string;
  locale: "es" | "en";
  coverImage?: string;
  client?: string;
  metrics?: string[];
  variant?: "default" | "featured";
};

export function CaseStudyCard({
  title,
  summary,
  tag,
  href,
  locale,
  coverImage,
  client,
  metrics,
  variant = "default"
}: CaseStudyCardProps) {
  const isFeatured = variant === "featured";

  return (
    <Card
      className={cn(
        "group relative h-full overflow-hidden border-white/10 bg-[#08101f]/78 transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-[#0b1426]/92",
        isFeatured ? "lg:grid lg:grid-cols-[1.08fr_0.92fr]" : "flex flex-col"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,#e44c44_0%,#2e636b_34%,#549c24_68%,#3d284c_100%)] opacity-90" />

      <Link
        aria-label={locale === "en" ? `Read ${title} case study` : `Ver caso ${title}`}
        className={cn(
          "relative block overflow-hidden bg-[linear-gradient(135deg,#0d1727_0%,#12233a_48%,#271a31_100%)]",
          isFeatured ? "min-h-[320px] lg:min-h-full" : "aspect-[16/9]"
        )}
        href={href as Route}
      >
        {coverImage ? (
          <Image
            alt={title}
            className="object-cover object-center transition duration-700 group-hover:scale-[1.035]"
            fill
            sizes={isFeatured ? "(max-width: 1024px) 100vw, 52vw" : "(max-width: 1024px) 100vw, 33vw"}
            src={coverImage}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,31,0.02)_0%,rgba(7,16,31,0.56)_100%),radial-gradient(circle_at_top_left,rgba(228,76,68,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(84,156,36,0.2),transparent_24%)]" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            {client ?? title}
          </span>
          <span className="h-2 w-2 rounded-full bg-[#549c24] shadow-[0_0_18px_rgba(84,156,36,0.85)]" />
        </div>
      </Link>

      <CardContent className={cn("flex flex-1 flex-col", isFeatured ? "justify-between gap-7 p-7 sm:p-9" : "gap-5")}>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border-[#e44c44]/30 bg-[#e44c44]/10 text-[#ffb0aa]">{tag}</Badge>
            {client ? <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{client}</div> : null}
          </div>

          <div className="space-y-3">
            <h3
              className={cn(
                "headline-balance font-display font-semibold tracking-tight text-white",
                isFeatured ? "text-3xl sm:text-4xl" : "text-2xl"
              )}
            >
              {title}
            </h3>
            <p className="text-sm leading-7 text-slate-300">{summary}</p>
          </div>

          {metrics?.length ? (
            <div className={cn("grid gap-2", isFeatured ? "sm:grid-cols-3" : "grid-cols-1")}>
              {metrics.slice(0, isFeatured ? 3 : 2).map((metric, index) => (
                <span
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-2 text-xs leading-5 text-slate-300"
                  key={metric}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      index % 3 === 0 && "bg-[#e44c44]",
                      index % 3 === 1 && "bg-[#2e636b]",
                      index % 3 === 2 && "bg-[#549c24]"
                    )}
                  />
                  {metric}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <Link
          className="mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-[#78d5d7]/25 bg-[#2e636b]/18 px-4 py-2 text-sm font-semibold text-[#a7eef0] transition hover:border-[#78d5d7]/45 hover:bg-[#2e636b]/28"
          href={href as Route}
        >
          {locale === "en" ? "Read case study" : "Ver el caso"}
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#549c24]" />
        </Link>
      </CardContent>
    </Card>
  );
}
