import { CaseStudyCard } from "@/components/sections/case-study-card";
import { SiteShell } from "@/components/site-shell";
import { getLocalePrefix, getSeedCaseStudies, getSiteContent } from "@/lib/content";
import type { Locale } from "@/lib/types";

export async function CaseStudiesIndexPage({ locale }: { locale: Locale }) {
  const [site, studies] = await Promise.all([getSiteContent(locale), getSeedCaseStudies(locale)]);
  const localePrefix = getLocalePrefix(locale);
  const preferredOrder = [
    "club-santa-lucia",
    "club-ab",
    "gamerleal",
    "directv-fans",
    "progra-mas",
    "quito-motors",
    "tarjeta-gpf",
    "roche",
    "halliburton",
    "club-suscriptores-el-comercio",
    "metro-puntos",
    "cebichomano"
  ];
  const visualOverrides: Record<string, string> = {
    "club-santa-lucia": "/images/case-studies/club-santa-lucia-home-v2.jpg",
    "club-ab": "/images/case-studies/club-ab-home.png",
    gamerleal: "/images/case-studies/gamerleal-home-v2.png"
  };
  const ordered = [
    ...preferredOrder
      .map((slug) => studies.find((study) => study.slug === slug))
      .filter((study): study is (typeof studies)[number] => Boolean(study)),
    ...studies.filter((study) => !preferredOrder.includes(study.slug))
  ].map((study) => ({
    ...study,
    coverImage: visualOverrides[study.slug] ?? study.coverImage
  }));
  const appliedSlugs = ["club-santa-lucia", "club-ab", "gamerleal"];
  const appliedCases = appliedSlugs
    .map((slug) => ordered.find((study) => study.slug === slug))
    .filter((study): study is (typeof ordered)[number] => Boolean(study));
  const legacyCases = ordered.filter((study) => !appliedSlugs.includes(study.slug));
  const portfolioSignals =
    locale === "en"
      ? ["Customer loyalty", "B2B incentives", "Employee rewards", "Regional fulfillment", "Digital communities"]
      : ["Lealtad B2C", "Incentivos B2B", "Rewards para empleados", "Fulfillment regional", "Comunidades digitales"];

  return (
    <SiteShell locale={locale} site={site}>
      <section className="section-space overflow-hidden pb-16">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <div className="section-kicker section-kicker--warm">
              {locale === "en" ? "Real portfolio" : "Portfolio real"}
            </div>
            <h1 className="headline-balance max-w-5xl font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              {locale === "en"
                ? "Proof that loyalty can be built for very different audiences."
                : "Prueba real de que la lealtad se puede construir para audiencias muy distintas."}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              {locale === "en"
                ? "These cases connect Zegendia's legacy with the new ecosystem: custom programs, reward operations, vertical platforms, and engagement models already taken to market."
                : "Estos casos conectan la trayectoria de Zegendia con el nuevo ecosistema: programas a la medida, operación de premios, plataformas verticales y modelos de engagement llevados al mercado."}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#071020]/80 p-6 shadow-[0_30px_90px_rgba(25,215,255,0.1)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(228,76,68,0.2),transparent_28%),radial-gradient(circle_at_70%_30%,rgba(46,99,107,0.28),transparent_30%),radial-gradient(circle_at_80%_82%,rgba(84,156,36,0.18),transparent_24%)]" />
            <div className="relative">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9de1e3]">
                {locale === "en" ? "What the portfolio proves" : "Lo que prueba el portfolio"}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {portfolioSignals.map((signal, index) => (
                  <div
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 text-sm text-slate-200"
                    key={signal}
                  >
                    <span
                      className={
                        index % 4 === 0
                          ? "h-2 w-2 rounded-full bg-[#e44c44]"
                          : index % 4 === 1
                            ? "h-2 w-2 rounded-full bg-[#2e636b]"
                            : index % 4 === 2
                              ? "h-2 w-2 rounded-full bg-[#549c24]"
                              : "h-2 w-2 rounded-full bg-[#3d284c]"
                      }
                    />
                    {signal}
                  </div>
                ))}
              </div>
              <p className="mt-6 border-l border-[#e44c44]/70 pl-4 text-sm leading-7 text-slate-300">
                {locale === "en"
                  ? "From enterprise brands to vertical programs, the pattern is the same: strategy, rules, technology, rewards, and operation working together."
                  : "Desde marcas corporativas hasta programas verticales, el patrón es el mismo: estrategia, reglas, tecnología, premios y operación trabajando juntos."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-shell">
          <div className="mb-9 max-w-3xl">
            <div className="section-kicker section-kicker--green">
              {locale === "en" ? "Applied platforms" : "Plataformas aplicadas"}
            </div>
            <h2 className="headline-balance font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {locale === "en"
                ? "Vertical cases that show the new Zegendia operating model."
                : "Casos verticales que muestran el nuevo modelo operativo de Zegendia."}
            </h2>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {appliedCases.map((study) => (
              <CaseStudyCard
                client={study.client}
                coverImage={study.coverImage}
                href={`${localePrefix}/case-studies/${study.slug}`}
                key={`${locale}-${study.slug}`}
                locale={locale}
                metrics={study.metrics}
                summary={study.summary}
                tag={study.sector}
                title={study.title}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-shell">
          <div className="mb-9 max-w-4xl">
            <div className="section-kicker section-kicker--cyan">
              {locale === "en" ? "Built for real brands" : "Construido para marcas reales"}
            </div>
            <h2 className="headline-balance font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {locale === "en"
                ? "A track record across loyalty, rewards, channels, employees, and fulfillment."
                : "Una trayectoria en loyalty, rewards, canales, empleados y fulfillment."}
            </h2>
          </div>

          {legacyCases[0] ? (
            <div className="mb-5">
              <CaseStudyCard
                client={legacyCases[0].client}
                coverImage={legacyCases[0].coverImage}
                href={`${localePrefix}/case-studies/${legacyCases[0].slug}`}
                locale={locale}
                metrics={legacyCases[0].metrics}
                summary={legacyCases[0].summary}
                tag={legacyCases[0].sector}
                title={legacyCases[0].title}
                variant="featured"
              />
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {legacyCases.slice(1).map((study) => (
              <CaseStudyCard
                client={study.client}
                coverImage={study.coverImage}
                href={`${localePrefix}/case-studies/${study.slug}`}
                key={`${locale}-${study.slug}`}
                locale={locale}
                metrics={study.metrics}
                summary={study.summary}
                tag={study.sector}
                title={study.title}
              />
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
