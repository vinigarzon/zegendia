import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

import { getSectionKickerAccentClass, type AccentTone } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type HeroProps = {
  locale: "es" | "en";
  eyebrow: string;
  title: string;
  text: string;
  ctas: { label: string; href: string }[];
  proofStrip: string[];
  spotlight: {
    title: string;
    text: string;
  };
  accent?: AccentTone;
};

export function Hero({ locale, eyebrow, title, text, ctas, proofStrip, spotlight, accent = "cyan" }: HeroProps) {
  const panelLabel = locale === "en" ? "Ecosystem view" : "Vista del ecosistema";
  const ecosystemLayers =
    locale === "en"
      ? [
          {
            alt: "Zegendia Core",
            logo: "/images/brand/zegendia-logo.png",
            widthClass: "w-[190px]",
            description: "Custom loyalty strategy, enterprise design, and programs built around real business logic."
          },
          {
            alt: "Oh My Rewards",
            logo: "/images/brand/oh-2.svg",
            widthClass: "w-[136px]",
            description: "Regional reward fulfillment, unified catalog, and real operational execution."
          },
          {
            alt: "PuntosPlus",
            logo: "/images/brand/puntosplus-logo-white.png",
            widthClass: "w-[220px]",
            description: "Loyalty software to launch, manage, and scale programs with speed."
          }
        ]
      : [
          {
            alt: "Zegendia Core",
            logo: "/images/brand/zegendia-logo.png",
            widthClass: "w-[190px]",
            description: "Estrategia loyalty a la medida, diseño enterprise y programas construidos sobre lógica real de negocio."
          },
          {
            alt: "Oh My Rewards",
            logo: "/images/brand/oh-2.svg",
            widthClass: "w-[136px]",
            description: "Fulfillment regional, catálogo unificado y operación real de premios."
          },
          {
            alt: "PuntosPlus",
            logo: "/images/brand/puntosplus-logo-white.png",
            widthClass: "w-[220px]",
            description: "Software de loyalty para lanzar, operar y escalar programas con velocidad."
          }
        ];

  return (
    <section className="section-space overflow-hidden">
      <div className="container-shell">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className={cn("section-kicker", getSectionKickerAccentClass(accent))}>
              <Sparkles className="h-3.5 w-3.5" />
              {eyebrow}
            </div>
            <h1 className="headline-balance max-w-4xl font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">{text}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {ctas.map((cta) => (
                <LinkButton
                  href={cta.href}
                  key={cta.href}
                  size="lg"
                  variant={
                    cta.href.includes("ohmyrewards")
                      ? "brandWarm"
                      : cta.href.includes("puntosplus")
                        ? "brandGreen"
                        : "default"
                  }
                >
                  {cta.label}
                </LinkButton>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {proofStrip.map((item) => (
                <div
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card className="relative min-h-[680px] overflow-hidden border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(228,76,68,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(84,156,36,0.14),transparent_30%),linear-gradient(180deg,rgba(4,8,22,0.12),rgba(4,8,22,0.7))]" />
            <div className="absolute inset-0">
              <Image
                alt={locale === "en" ? "Zegendia ecosystem visualization" : "Visual del ecosistema Zegendia"}
                className="object-cover object-bottom opacity-55"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                src="/images/hero/hero-ecosystem-clean-v2.png"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#07101f]/96 via-[#07101f]/84 via-45% to-transparent" />
            <CardContent className="relative pb-24">
              <div className="max-w-[30rem] space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-[#78d5d7]">{panelLabel}</div>
                    <div className="mt-2 font-display text-2xl font-semibold text-white">
                      {spotlight.title}
                    </div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 p-3 text-[#78d5d7]">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>

                <p className="max-w-[27rem] text-base leading-7 text-slate-300">{spotlight.text}</p>

                <div className="grid gap-3">
                  {ecosystemLayers.map((layer) => (
                    <div className="border border-white/10 bg-[#07101f]/62 p-4 backdrop-blur-sm" key={layer.alt}>
                      <div className={`relative h-8 ${layer.widthClass}`}>
                        <Image alt={layer.alt} className="object-contain object-left" fill sizes="220px" src={layer.logo} />
                      </div>
                      <div className="mt-3 text-sm leading-7 text-slate-300">{layer.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
