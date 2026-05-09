import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CTASection } from "@/components/sections/cta-section";
import { Markdown } from "@/lib/markdown";
import { SiteShell } from "@/components/site-shell";
import { getSeedCaseStudyBySlug, getSiteContent } from "@/lib/content";
import type { Locale } from "@/lib/types";

export async function CaseStudyPage({
  locale,
  slug
}: {
  locale: Locale;
  slug: string;
}) {
  const [site, study] = await Promise.all([getSiteContent(locale), getSeedCaseStudyBySlug(locale, slug)]);
  if (!study) {
    notFound();
  }
  const backHref = locale === "en" ? "/en/case-studies" : "/case-studies";
  const contactHref = locale === "en" ? "/en/contact" : "/contact";
  const profileItems = [
    { label: locale === "en" ? "Client" : "Cliente", value: study.client },
    { label: locale === "en" ? "Program" : "Programa", value: study.programName },
    { label: locale === "en" ? "Role" : "Rol", value: study.role },
    { label: "Sector", value: study.sector },
    { label: locale === "en" ? "Stage" : "Etapa", value: study.year }
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

  return (
    <SiteShell locale={locale} site={site}>
      <section className="section-space overflow-hidden pb-14">
        <div className="container-shell">
          <Link
            className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-[#78d5d7]/40 hover:text-white"
            href={backHref}
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#e44c44]" />
            {locale === "en" ? "Back to portfolio" : "Volver al portfolio"}
          </Link>

          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <div className="section-kicker section-kicker--warm">
                {locale === "en" ? "Case study" : "Caso de éxito"}
              </div>
              {study.year ? (
                <div className="mb-4 inline-flex rounded-full border border-[#549c24]/25 bg-[#549c24]/10 px-3 py-1 text-xs font-medium text-[#b7e78c]">
                  {study.year}
                </div>
              ) : null}
              <h1 className="headline-balance font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                {study.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">{study.excerpt}</p>
              {study.tags?.length ? (
                <div className="mt-7 flex flex-wrap gap-2">
                  {study.tags.map((tag, index) => (
                    <span
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300"
                      key={tag}
                    >
                      <span
                        className={
                          index % 3 === 0
                            ? "h-1.5 w-1.5 rounded-full bg-[#e44c44]"
                            : index % 3 === 1
                              ? "h-1.5 w-1.5 rounded-full bg-[#2e636b]"
                              : "h-1.5 w-1.5 rounded-full bg-[#549c24]"
                        }
                      />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {study.coverImage ? (
              <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#08101f] p-3 shadow-[0_30px_90px_rgba(25,215,255,0.12)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(228,76,68,0.24),transparent_30%),radial-gradient(circle_at_84%_72%,rgba(84,156,36,0.16),transparent_24%)]" />
                <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-white/10">
                  <Image
                    alt={study.title}
                    className="object-cover object-center"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 54vw"
                    src={study.coverImage}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(4,8,22,0.5)_100%)]" />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.76fr_1.24fr]">
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,#e44c44,#2e636b,#549c24,#3d284c)]" />
              <div className="text-xs uppercase tracking-[0.22em] text-[#9de1e3]">
                {locale === "en" ? "Program profile" : "Ficha del programa"}
              </div>
              <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-300">
                {profileItems.map((item) => (
                  <div className="border-b border-white/8 pb-3 last:border-b-0 last:pb-0" key={item.label}>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</div>
                    <div className="mt-1 text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {study.metrics?.length ? (
              <div className="rounded-[30px] border border-white/10 bg-[#071020]/80 p-6">
                <div className="text-xs uppercase tracking-[0.22em] text-[#b7e78c]">
                  {locale === "en" ? "Commercial signals" : "Señales comerciales"}
                </div>
                <div className="mt-4 space-y-3">
                  {study.metrics.map((item, index) => (
                    <div className="flex gap-3 text-sm leading-7 text-slate-200" key={item}>
                      <span
                        className={
                          index % 3 === 0
                            ? "mt-2 h-2 w-2 shrink-0 rounded-full bg-[#e44c44]"
                            : index % 3 === 1
                              ? "mt-2 h-2 w-2 shrink-0 rounded-full bg-[#2e636b]"
                              : "mt-2 h-2 w-2 shrink-0 rounded-full bg-[#549c24]"
                        }
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-[#ffb0aa]">
                {locale === "en" ? "What was built" : "Qué se construyó"}
              </div>
              <div className="mt-4 space-y-3">
                {study.outcomes.map((item) => (
                  <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-slate-200" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-6 min-w-0">
            {study.quote ? (
              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(228,76,68,0.12),rgba(46,99,107,0.08))] px-6 py-5 text-lg leading-8 text-white">
                {study.quote}
              </div>
            ) : null}
            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.045] p-6 sm:p-8">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,#e44c44,#2e636b,#549c24,#3d284c)]" />
              <Markdown source={study.body} />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        primary={{ href: contactHref, label: locale === "en" ? "Build something similar" : "Construir algo similar" }}
        secondary={{ href: backHref, label: locale === "en" ? "See more cases" : "Ver más casos" }}
        text={
          locale === "en"
            ? "If there is a behavior you need to motivate, Zegendia can help turn it into rules, points, benefits, rewards, and measurable operation."
            : "Si hay una conducta que necesitas motivar, Zegendia puede convertirla en reglas, puntos, beneficios, premios y operación medible."
        }
        title={
          locale === "en"
            ? "A case study is only the beginning. The structure can be adapted to your audience."
            : "Un caso es solo el comienzo. La estructura puede adaptarse a tu audiencia."
        }
      />
    </SiteShell>
  );
}
