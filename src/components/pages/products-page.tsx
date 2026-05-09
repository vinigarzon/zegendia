import Image from "next/image";

import { CTASection } from "@/components/sections/cta-section";
import { PageHero } from "@/components/sections/page-hero";
import { SectionHeading } from "@/components/sections/section-heading";
import { SiteShell } from "@/components/site-shell";
import { LinkButton } from "@/components/ui/button";
import { getSiteContent, getProductsContent } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

export async function ProductsPage({ locale }: { locale: Locale }) {
  const [site, products] = await Promise.all([getSiteContent(locale), getProductsContent(locale)]);
  const overview = products.overview as {
    hero: { eyebrow: string; title: string; text: string };
    cards: { name: string; status: string; headline: string; description: string; bullets: string[] }[];
    comparison: { label: string; recommended: string }[];
  };

  const accentStyles = [
    {
      line: "bg-gradient-to-r from-[#e44c44] via-[#ff8a83] to-transparent",
      text: "text-[#ffb0aa]",
      border: "border-[#e44c44]/18",
      dot: "bg-[#e44c44]"
    },
    {
      line: "bg-gradient-to-r from-[#2e636b] via-[#78d5d7] to-transparent",
      text: "text-[#9de1e3]",
      border: "border-[#2e636b]/18",
      dot: "bg-[#2e636b]"
    },
    {
      line: "bg-gradient-to-r from-[#549c24] via-[#8ed85d] to-transparent",
      text: "text-[#b7e78c]",
      border: "border-[#549c24]/18",
      dot: "bg-[#549c24]"
    }
  ] as const;

  const linksByName: Record<
    string,
    {
      details: string;
      detailsLabel: string;
      platform?: string;
      platformLabel?: string;
      logo: { src: string; widthClass: string; sizes: string };
    }
  > = {
    "Zegendia Core": {
      details: locale === "en" ? "/en/contact" : "/contact",
      detailsLabel: locale === "en" ? "Let's talk" : "Hablemos",
      logo: {
        src: "/images/brand/zegendia-logo.png",
        widthClass: "w-[220px]",
        sizes: "220px"
      }
    },
    "Oh My Rewards": {
      details: locale === "en" ? "/en/products/oh-my-rewards" : "/products/oh-my-rewards",
      detailsLabel: locale === "en" ? "See details" : "Ver detalles",
      platform: "https://app.ohmyrewards.com",
      platformLabel: locale === "en" ? "Open platform" : "Abrir plataforma",
      logo: {
        src: "/images/brand/oh-2.svg",
        widthClass: "w-[150px]",
        sizes: "150px"
      }
    },
    PuntosPlus: {
      details: locale === "en" ? "/en/products/puntosplus" : "/products/puntosplus",
      detailsLabel: locale === "en" ? "See details" : "Ver detalles",
      platform: "https://puntosplus.com",
      platformLabel: locale === "en" ? "Open platform" : "Abrir plataforma",
      logo: {
        src: "/images/brand/puntosplus-logo-white.png",
        widthClass: "w-[230px]",
        sizes: "230px"
      }
    }
  };

  return (
    <SiteShell locale={locale} site={site}>
      <PageHero accent="warm" eyebrow={overview.hero.eyebrow} text={overview.hero.text} title={overview.hero.title} />

      <section className="section-space pt-0">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-stretch">
          <div>
            <SectionHeading
              accent="green"
              eyebrow={locale === "en" ? "How to choose" : "Cómo elegir"}
              title={
                locale === "en"
                  ? "Pick the layer that solves the real bottleneck in your loyalty operation."
                  : "Elige la capa que resuelve el verdadero cuello de botella de tu operación de loyalty."
              }
              description={
                locale === "en"
                  ? "Some companies need custom strategy and execution. Others already have a program but need rewards fulfillment. Others want to launch fast without building software from scratch."
                  : "Algunas compañías necesitan estrategia y ejecución a la medida. Otras ya tienen un programa, pero les falta fulfillment de premios. Otras quieren lanzar rápido sin construir software desde cero."
              }
            />

            <div className="mt-8 space-y-6">
              {overview.comparison.map((item, index) => (
                <div className="grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-[1fr_auto] sm:items-start" key={item.label}>
                  <div className="text-sm leading-7 text-slate-300 sm:text-base">{item.label}</div>
                  <div className={cn("text-sm font-semibold uppercase tracking-[0.22em]", accentStyles[index % accentStyles.length].text)}>
                    {item.recommended}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[40px] border border-white/10 min-h-[520px]">
            <div className="absolute inset-0">
              <Image
                alt={locale === "en" ? "Zegendia product ecosystem background" : "Fondo del ecosistema de productos Zegendia"}
                className="object-cover object-bottom"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                src="/images/products/products-spectrum-wave.png"
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,22,0.94)_0%,rgba(6,10,22,0.72)_38%,rgba(6,10,22,0.94)_100%)]" />
            <div className="relative flex min-h-[520px] flex-col justify-between p-7 sm:p-8">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-[#9de1e3]">
                  {locale === "en" ? "Ecosystem view" : "Vista del ecosistema"}
                </div>
                <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold text-white sm:text-4xl">
                  {locale === "en"
                    ? "Three product lines, one operating logic for LATAM."
                    : "Tres líneas de producto, una sola lógica operativa para LATAM."}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                  {locale === "en"
                    ? "Zegendia can design the program, connect the rewards layer, or give you software to launch and manage it directly."
                    : "Zegendia puede diseñar el programa, conectar la capa de rewards o darte software para lanzarlo y operarlo directamente."}
                </p>
              </div>

              <div className="grid gap-4">
                {overview.cards.map((card, index) => (
                  <div
                    className="rounded-[28px] border border-white/10 bg-[#081120]/72 p-5 backdrop-blur-sm"
                    key={card.name}
                  >
                    <div className={cn("mb-4 h-px w-20", accentStyles[index % accentStyles.length].line)} />
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{card.status}</div>
                        <div className="mt-2 font-display text-2xl font-semibold text-white">{card.name}</div>
                      </div>
                      <div className={cn("text-sm font-semibold uppercase tracking-[0.2em]", accentStyles[index % accentStyles.length].text)}>
                        0{index + 1}
                      </div>
                    </div>
                    <div className="mt-3 text-sm leading-7 text-slate-300">{card.headline}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space pt-4">
        <div className="container-shell grid gap-5 lg:grid-cols-3">
          {overview.cards.map((card, index) => {
            const links = linksByName[card.name];

            return (
              <div
                className={cn(
                  "relative overflow-hidden rounded-[34px] border bg-[linear-gradient(180deg,rgba(10,16,31,0.92)_0%,rgba(7,12,24,0.96)_100%)] p-6",
                  accentStyles[index % accentStyles.length].border
                )}
                key={card.name}
              >
                <div className={cn("absolute inset-x-0 top-0 h-px opacity-90", accentStyles[index % accentStyles.length].line)} />
                <div className="flex min-h-full flex-col">
                  <div className={cn("text-xs uppercase tracking-[0.22em]", accentStyles[index % accentStyles.length].text)}>
                    {card.status}
                  </div>
                  <div className={`relative mt-5 h-10 ${links.logo.widthClass}`}>
                    <Image alt={card.name} className="object-contain object-left" fill sizes={links.logo.sizes} src={links.logo.src} />
                  </div>
                  <h3 className="mt-6 font-display text-3xl font-semibold text-white">{card.headline}</h3>
                  <p className="mt-4 text-sm leading-8 text-slate-300 sm:text-base">{card.description}</p>

                  <div className="mt-6 space-y-3">
                    {card.bullets.map((bullet) => (
                      <div className="flex items-start gap-3" key={bullet}>
                        <span className={cn("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", accentStyles[index % accentStyles.length].dot)} />
                        <span className="text-sm leading-7 text-slate-200">{bullet}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <LinkButton href={links.details} size="sm" variant={card.name === "Zegendia Core" ? "secondary" : undefined}>
                      {links.detailsLabel}
                    </LinkButton>
                    {links.platform && links.platformLabel ? (
                      <LinkButton
                        href={links.platform}
                        size="sm"
                        variant={card.name === "Oh My Rewards" ? "brandWarm" : "brandGreen"}
                      >
                        {links.platformLabel}
                      </LinkButton>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <CTASection
        primary={{ href: locale === "en" ? "/en/contact" : "/contact", label: locale === "en" ? "Talk to the team" : "Hablar con el equipo" }}
        primaryVariant="brandWarm"
        secondary={{ href: "https://puntosplus.com", label: "PuntosPlus" }}
        secondaryVariant="brandGreen"
        text={
          locale === "en"
            ? "We can meet you where you are today: a custom loyalty design, a rewards fulfillment layer, or ready-to-launch software."
            : "Podemos entrar por donde hoy más sentido haga: un programa a la medida, una capa de rewards fulfillment o software listo para lanzar."
        }
        title={
          locale === "en"
            ? "The right product depends on where the bottleneck really is."
            : "El producto correcto depende de dónde está el cuello de botella real."
        }
      />
    </SiteShell>
  );
}
