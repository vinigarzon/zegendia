import Image from "next/image";

import { PageHero } from "@/components/sections/page-hero";
import { SectionHeading } from "@/components/sections/section-heading";
import { StatsStrip } from "@/components/sections/stats-strip";
import { SiteShell } from "@/components/site-shell";
import { getSiteContent } from "@/lib/content";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

const accentStyles = [
  {
    line: "bg-gradient-to-r from-[#e44c44] via-[#ff8a83] to-transparent",
    border: "border-[#e44c44]/22",
    text: "text-[#ffb0aa]",
    chip: "bg-[#e44c44]/12 text-[#ffb0aa] border-[#e44c44]/24",
    dot: "bg-[#e44c44]"
  },
  {
    line: "bg-gradient-to-r from-[#549c24] via-[#8ed85d] to-transparent",
    border: "border-[#549c24]/20",
    text: "text-[#b7e78c]",
    chip: "bg-[#549c24]/12 text-[#b7e78c] border-[#549c24]/22",
    dot: "bg-[#549c24]"
  },
  {
    line: "bg-gradient-to-r from-[#2e636b] via-[#78d5d7] to-transparent",
    border: "border-[#2e636b]/20",
    text: "text-[#9de1e3]",
    chip: "bg-[#2e636b]/12 text-[#9de1e3] border-[#2e636b]/22",
    dot: "bg-[#2e636b]"
  },
  {
    line: "bg-gradient-to-r from-[#3d284c] via-[#b38ad1] to-transparent",
    border: "border-[#3d284c]/24",
    text: "text-[#d4b7e7]",
    chip: "bg-[#3d284c]/14 text-[#d4b7e7] border-[#3d284c]/24",
    dot: "bg-[#3d284c]"
  }
] as const;

export async function AboutPage({ locale }: { locale: Locale }) {
  const site = await getSiteContent(locale);
  const capabilities = site.about.capabilities ?? [];
  const team = site.about.team;

  const operatingSignals =
    locale === "en"
      ? [
          "Strategy grounded in business objectives",
          "Regional execution across multiple markets",
          "Physical and digital rewards under one model",
          "Technology, logistics, and client management connected"
        ]
      : [
          "Estrategia aterrizada a objetivos comerciales",
          "Ejecución regional en múltiples mercados",
          "Rewards físicos y digitales bajo un mismo modelo",
          "Tecnología, logística y gestión de clientes conectadas"
        ];

  const storyPanelTitle =
    locale === "en"
      ? "What Zegendia learned by operating real programs"
      : "Lo que Zegendia aprendió operando programas reales";
  const storyPanelText =
    locale === "en"
      ? "Loyalty only works when strategy, delivery, and follow-through stay aligned after launch."
      : "La lealtad solo funciona cuando estrategia, ejecución y seguimiento se mantienen alineados después del lanzamiento.";

  const timelineDescription =
    locale === "en"
      ? "The company evolved from custom regional projects into a clearer product and operations architecture for Latin America."
      : "La compañía evolucionó desde proyectos regionales a la medida hacia una arquitectura más clara de producto y operación para Latinoamérica.";

  const teamPanelTitle =
    locale === "en"
      ? "Regional coordination, local understanding"
      : "Coordinación regional, entendimiento local";
  const teamPanelText =
    locale === "en"
      ? "The team works across strategy, product, technology, rewards operations, and account growth to keep programs moving from design to delivery."
      : "El equipo trabaja entre estrategia, producto, tecnología, operación de rewards y crecimiento de cuentas para llevar los programas desde el diseño hasta la entrega real.";
  const teamHubs = team
    ? team.members.map((member) => member.location)
    : [];

  return (
    <SiteShell locale={locale} site={site}>
      <PageHero
        accent="warm"
        eyebrow={site.about.hero.eyebrow}
        text={site.about.hero.text}
        title={site.about.hero.title}
      />

      <StatsStrip items={site.about.highlights} />

      <section className="section-space pt-10">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.74fr_1.26fr] lg:items-start">
          <div className="space-y-8 lg:sticky lg:top-28">
            <SectionHeading
              accent="green"
              eyebrow={locale === "en" ? "Experience" : "Experiencia"}
              title={
                locale === "en"
                  ? "Built from the hard part: making loyalty actually work after launch."
                  : "Construida desde la parte difícil: hacer que la lealtad funcione de verdad después del lanzamiento."
              }
              description={
                locale === "en"
                  ? "What differentiates Zegendia is not only what it can design, but what it has already operated across the region."
                  : "Lo que diferencia a Zegendia no es solo lo que puede diseñar, sino lo que ya ha operado en la región."
              }
            />

            <div className="space-y-4">
              {operatingSignals.map((item, index) => (
                <div className="flex items-start gap-4" key={item}>
                  <span className={cn("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", accentStyles[index % accentStyles.length].dot)} />
                  <p className="text-sm leading-7 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,14,30,0.96)_0%,rgba(8,14,30,0.8)_100%)] p-7 sm:p-9">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(228,76,68,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(46,99,107,0.18),transparent_30%),radial-gradient(circle_at_70%_80%,rgba(84,156,36,0.14),transparent_24%)]" />
            <div className="relative grid gap-10 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6 text-base leading-8 text-slate-300">
                {site.about.story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="flex flex-col justify-between gap-8">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-[#9de1e3]">{storyPanelTitle}</div>
                  <p className="mt-4 text-lg leading-8 text-white">{storyPanelText}</p>
                </div>

                <div className="space-y-4">
                  {site.about.highlights.map((item, index) => (
                    <div
                      className="grid gap-3 border-b border-white/10 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[112px_1fr] sm:items-end"
                      key={item.label}
                    >
                      <div className={cn("font-display text-4xl font-semibold", accentStyles[index % accentStyles.length].text)}>
                        {item.value}
                      </div>
                      <div className="text-sm leading-6 text-slate-300">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {site.about.capabilityIntro ? (
        <section className="section-space pt-6">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                accent="warm"
                eyebrow={site.about.capabilityIntro.eyebrow}
                title={site.about.capabilityIntro.title}
                description={site.about.capabilityIntro.text}
              />
            </div>

            <div className="space-y-7">
              {capabilities.map((item, index) => (
                <div className="grid gap-5 border-t border-white/10 pt-7 md:grid-cols-[110px_1fr] md:gap-8" key={item.title}>
                  <div className="space-y-3">
                    <div className={cn("text-xs uppercase tracking-[0.24em]", accentStyles[index % accentStyles.length].text)}>
                      0{index + 1}
                    </div>
                    <div className={cn("h-px w-full", accentStyles[index % accentStyles.length].line)} />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                    <h3 className="font-display text-2xl font-semibold text-white">{item.title}</h3>
                    <p className="text-sm leading-7 text-slate-300 sm:text-base">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-space pt-6">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.68fr_1.32fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              accent="green"
              eyebrow={locale === "en" ? "Timeline" : "Evolución"}
              title={
                locale === "en"
                  ? "From custom projects to a clearer loyalty ecosystem."
                  : "De proyectos a la medida a un ecosistema de loyalty más claro."
              }
              description={timelineDescription}
            />
          </div>

          <div className="relative pl-8 sm:pl-10">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-[linear-gradient(180deg,rgba(228,76,68,0.4),rgba(46,99,107,0.35),rgba(84,156,36,0.24),transparent)] sm:left-4" />
            <div className="space-y-10">
              {site.about.timeline.map((item, index) => (
                <div className="relative" key={item.year}>
                  <span
                    className={cn(
                      "absolute left-[-1.95rem] top-2 h-4 w-4 rounded-full border-4 border-[#040816] sm:left-[-2.45rem]",
                      accentStyles[index % accentStyles.length].dot
                    )}
                  />
                  <div className="grid gap-3 lg:grid-cols-[150px_1fr] lg:gap-8">
                    <div className={cn("text-sm font-semibold uppercase tracking-[0.24em]", accentStyles[index % accentStyles.length].text)}>
                      {item.year}
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-display text-2xl font-semibold text-white">{item.title}</h3>
                      <p className="max-w-3xl text-base leading-8 text-slate-300">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {team ? (
        <section className="section-space pt-6">
          <div className="container-shell">
            <SectionHeading
              accent="warm"
              align="center"
              eyebrow={team.eyebrow}
              title={team.title}
              description={team.text}
            />

            <div className="relative mt-10 overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,14,28,0.92)_0%,rgba(8,14,28,0.78)_100%)] p-6 sm:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(84,156,36,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(61,40,76,0.24),transparent_28%),radial-gradient(circle_at_60%_16%,rgba(228,76,68,0.14),transparent_18%)]" />
              <div className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-[#78d5d7]">{teamPanelTitle}</div>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{teamPanelText}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {teamHubs.map((hub, index) => (
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200" key={hub}>
                      <span className={cn("h-2.5 w-2.5 rounded-full", accentStyles[index % accentStyles.length].dot)} />
                      {hub}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {team.members.map((member, index) => (
                <div
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,15,28,0.82)_0%,rgba(7,12,24,0.94)_100%)] p-5"
                  key={member.name}
                >
                  <div className={cn("absolute inset-x-0 top-0 h-px opacity-90", accentStyles[index % accentStyles.length].line)} />
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(120,213,215,0.08),transparent_34%),linear-gradient(180deg,#10192d_0%,#09111f_100%)]">
                      {member.image ? (
                        <Image
                          alt={member.name}
                          className="object-contain object-bottom"
                          fill
                          sizes="80px"
                          src={member.image}
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <div className={cn("text-[11px] uppercase tracking-[0.22em]", accentStyles[index % accentStyles.length].text)}>
                        {member.location}
                      </div>
                      <h3 className="mt-2 font-display text-xl font-semibold text-white">{member.name}</h3>
                      <div className={cn("mt-2 text-sm leading-6", accentStyles[index % accentStyles.length].text)}>
                        {member.role}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-300">{member.focus}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </SiteShell>
  );
}
