import Image from "next/image";

import { LeadForm } from "@/components/sections/lead-form";
import { SiteShell } from "@/components/site-shell";
import { LinkButton } from "@/components/ui/button";
import { getLocalePrefix, getSiteContent } from "@/lib/content";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

export async function ContactPage({ locale }: { locale: Locale }) {
  const site = await getSiteContent(locale);
  const localePrefix = getLocalePrefix(locale);
  const offices = site.footer.contactCards.slice(0, 3);

  const quickRoutes = [
    {
      label: locale === "en" ? "I need a full program" : "Necesito un programa completo",
      product: "PuntosPlus / Zegendia Core",
      color: "bg-[#549c24]",
      text:
        locale === "en"
          ? "For customers, channels, teams, employees or communities."
          : "Para clientes, canales, equipos, empleados o comunidades."
    },
    {
      label: locale === "en" ? "I already have loyalty" : "Ya tengo un programa",
      product: "Oh My Rewards",
      color: "bg-[#e44c44]",
      text:
        locale === "en"
          ? "Connect your platform to regional rewards fulfillment."
          : "Conecta tu plataforma a fulfillment regional de premios."
    },
    {
      label: locale === "en" ? "I need a custom model" : "Necesito algo a la medida",
      product: "Zegendia Core",
      color: "bg-[#2e636b]",
      text:
        locale === "en"
          ? "Strategy, rules, campaigns, technology and operations."
          : "Estrategia, reglas, campañas, tecnología y operación."
    }
  ];

  const processSteps = [
    {
      title: locale === "en" ? "We understand the audience" : "Entendemos la audiencia",
      text:
        locale === "en"
          ? "Who you need to motivate, in which countries, and what behavior matters."
          : "A quién necesitas motivar, en qué países y qué conducta importa."
    },
    {
      title: locale === "en" ? "We recommend the right layer" : "Recomendamos la capa correcta",
      text:
        locale === "en"
          ? "PuntosPlus, Oh My Rewards, Zegendia Core, or a combination."
          : "PuntosPlus, Oh My Rewards, Zegendia Core o una combinación."
    },
    {
      title: locale === "en" ? "We define the next move" : "Definimos el siguiente paso",
      text:
        locale === "en"
          ? "Demo, sandbox, early setup, or a tailored discovery session."
          : "Demo, sandbox, configuración inicial o sesión de descubrimiento."
    }
  ];

  const proofSignals = [
    locale === "en" ? "20+ years building loyalty" : "20+ años construyendo loyalty",
    locale === "en" ? "LATAM rewards operation" : "Operación de premios en LATAM",
    locale === "en" ? "Software, API and fulfillment" : "Software, API y fulfillment",
    locale === "en" ? "For SMEs and enterprise" : "Para pymes y enterprise"
  ];
  const officeAccents = ["bg-[#549c24]", "bg-[#2e636b]", "bg-[#e44c44]"];

  return (
    <SiteShell locale={locale} site={site}>
      <section className="relative overflow-hidden pb-16 pt-14 sm:pt-20 lg:pb-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(228,76,68,0.18),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(46,99,107,0.24),transparent_26%),radial-gradient(circle_at_80%_82%,rgba(84,156,36,0.14),transparent_24%)]" />
          <div className="absolute inset-x-0 bottom-0 h-72 bg-[linear-gradient(180deg,transparent,#040816_80%)]" />
        </div>

        <div className="container-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="section-kicker section-kicker--warm">{site.contact.hero.eyebrow}</div>
            <h1 className="headline-balance max-w-4xl font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              {site.contact.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-300">{site.contact.hero.text}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="#contact-form" size="lg" variant="brandWarm">
                {locale === "en" ? "Start the brief" : "Empezar el brief"}
              </LinkButton>
              <LinkButton href={`${localePrefix}/products`} size="lg" variant="secondary">
                {locale === "en" ? "See ecosystem" : "Ver ecosistema"}
              </LinkButton>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {proofSignals.map((signal, index) => (
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm text-slate-200"
                  key={signal}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      index === 0
                        ? "bg-[#e44c44]"
                        : index === 1
                          ? "bg-[#2e636b]"
                          : index === 2
                            ? "bg-[#549c24]"
                            : "bg-[#3d284c]"
                    )}
                  />
                  {signal}
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[42px] border border-white/10 bg-[#071020]/70 shadow-[0_40px_100px_rgba(46,99,107,0.18)]">
            <div className="absolute inset-0">
              <Image
                alt={locale === "en" ? "Abstract loyalty data flow" : "Flujo abstracto de datos de loyalty"}
                className="object-cover object-bottom opacity-72"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                src="/images/products/products-spectrum-wave.png"
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,22,0.82)_0%,rgba(4,8,22,0.48)_42%,rgba(4,8,22,0.9)_100%)]" />
            <div className="relative flex min-h-[640px] flex-col p-6 sm:p-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9de1e3]">
                    {locale === "en" ? "Routing engine" : "Motor de recomendación"}
                  </div>
                  <h2 className="mt-4 max-w-lg font-display text-3xl font-semibold text-white sm:text-4xl">
                    {locale === "en"
                      ? "One conversation. The right path for your loyalty operation."
                      : "Una conversación. La ruta correcta para tu operación de loyalty."}
                  </h2>
                </div>
                <div className="hidden h-14 w-14 items-center justify-center rounded-full border border-[#78d5d7]/25 bg-[#2e636b]/22 text-2xl text-[#a7eef0] sm:flex">
                  →
                </div>
              </div>

              <div className="mt-10 grid gap-4">
                {quickRoutes.map((route) => (
                  <div className="rounded-[26px] border border-white/10 bg-[#071020]/72 p-4 backdrop-blur-sm sm:p-5" key={route.label}>
                    <div className="flex items-start gap-4">
                      <span className={cn("mt-1 h-3 w-3 shrink-0 rounded-full", route.color)} />
                      <div>
                        <div className="text-sm font-semibold text-white">{route.label}</div>
                        <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{route.product}</div>
                        <p className="mt-3 text-sm leading-7 text-slate-300">{route.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-black/35 p-5 backdrop-blur-md">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b7e78c]">
                {locale === "en" ? "Product fit first" : "Primero, el encaje correcto"}
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {locale === "en"
                    ? "The brief helps us identify whether your best next step is software, rewards fulfillment, strategy, or a connected loyalty ecosystem."
                    : "El brief nos ayuda a identificar si tu mejor siguiente paso es software, fulfillment de premios, estrategia o un ecosistema de loyalty conectado."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-shell">
          <div className="grid gap-5 lg:grid-cols-3">
            {site.contact.introCards.flatMap((card) => card.lines).slice(0, 6).map((line, index) => (
              <div
                className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-[#78d5d7]/25 hover:bg-white/[0.06]"
                key={line}
              >
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-px",
                    index % 3 === 0
                      ? "bg-[#e44c44]"
                      : index % 3 === 1
                        ? "bg-[#2e636b]"
                        : "bg-[#549c24]"
                  )}
                />
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {locale === "en" ? "Brief signal" : "Señal del brief"}
                </div>
                <div className="mt-4 font-display text-2xl font-semibold text-white">{line}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-shell">
          <div className="grid gap-8 overflow-hidden rounded-[42px] border border-white/10 bg-[#071020]/70 p-6 shadow-[0_30px_90px_rgba(46,99,107,0.12)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-8">
            <div className="relative min-h-[420px] overflow-hidden rounded-[34px] border border-white/10 bg-black/25">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_28%,rgba(228,76,68,0.16),transparent_28%),radial-gradient(circle_at_50%_48%,rgba(84,156,36,0.15),transparent_25%),radial-gradient(circle_at_70%_76%,rgba(61,40,76,0.16),transparent_28%)]" />
              <Image
                alt={locale === "en" ? "Zegendia office presence map" : "Mapa de presencia de oficinas Zegendia"}
                className="object-contain p-4 sm:p-6"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                src="/images/sections/contact-offices-map.png"
              />
            </div>

            <div>
              <div className="section-kicker section-kicker--warm">
                {locale === "en" ? "Regional presence" : "Presencia regional"}
              </div>
              <h2 className="headline-balance font-display text-4xl font-semibold text-white sm:text-5xl">
                {locale === "en"
                  ? "A LATAM operation connected from three strategic offices."
                  : "Una operación LATAM conectada desde tres oficinas estratégicas."}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                {locale === "en"
                  ? "Our footprint supports conversations, partnerships and reward operations across the region, with offices in Panama, Mexico and the United States."
                  : "Nuestra presencia acompaña conversaciones, alianzas y operación de premios en la región, con oficinas en Panamá, México y Estados Unidos."}
              </p>

              <div className="mt-8 space-y-5">
                {offices.map((office, index) => (
                  <div className="grid grid-cols-[14px_1fr] gap-4" key={office.market}>
                    <span className={cn("mt-2 h-3 w-3 rounded-full", officeAccents[index % officeAccents.length])} />
                    <div className="border-b border-white/10 pb-5">
                      <div className="font-display text-2xl font-semibold text-white">{office.market}</div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm leading-6 text-slate-400">
                        {office.detail.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space pt-2" id="contact-form">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <aside className="lg:sticky lg:top-24">
            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#071020]/80 p-6 shadow-[0_30px_90px_rgba(228,76,68,0.08)]">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,#e44c44,#2e636b,#549c24,#3d284c)]" />
              <div className="section-kicker section-kicker--green">
                {locale === "en" ? "After you send it" : "Después de enviarlo"}
              </div>
              <h2 className="headline-balance font-display text-4xl font-semibold text-white">
                {locale === "en" ? "We turn your brief into a clear next step." : "Convertimos tu brief en un siguiente paso claro."}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {locale === "en"
                  ? "With the right context, we can recommend the product layer, operating scope and first action with much more precision."
                  : "Con el contexto correcto, podemos recomendar la capa de producto, el alcance operativo y la primera acción con mucha más precisión."}
              </p>

              <div className="mt-7 space-y-4">
                {processSteps.map((step, index) => (
                  <div className="grid grid-cols-[42px_1fr] gap-4" key={step.title}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div className="border-b border-white/10 pb-4">
                      <div className="font-semibold text-white">{step.title}</div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-[28px] border border-[#e44c44]/22 bg-[#e44c44]/10 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb0aa]">
                  {locale === "en" ? "Fastest route" : "Ruta más rápida"}
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {locale === "en"
                    ? "If you already have a loyalty platform, mention it. We can evaluate Oh My Rewards as the fulfillment layer."
                    : "Si ya tienes una plataforma de loyalty, menciónalo. Podemos evaluar Oh My Rewards como capa de fulfillment."}
                </p>
              </div>
            </div>
          </aside>

          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.045] p-5 sm:p-7">
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,#e44c44,#2e636b,#549c24,#3d284c)]" />
            <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="section-kicker section-kicker--cyan">{site.contact.form.title}</div>
                <p className="max-w-3xl text-base leading-8 text-slate-300">{site.contact.form.description}</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                {locale === "en" ? "Secure lead capture" : "Lead seguro"}
              </div>
            </div>
            <form
              aria-hidden="true"
              className="hidden"
              data-netlify="true"
              data-netlify-honeypot="website"
              data-netlify-recaptcha="true"
              hidden
              method="POST"
              name="zegendia-contact"
            >
              <input name="form-name" type="hidden" value="zegendia-contact" />
              <input name="name" type="text" />
              <input name="company" type="text" />
              <input name="email" type="email" />
              <input name="country" type="text" />
              <input name="phone" type="text" />
              <input name="companyType" type="text" />
              <input name="objective" type="text" />
              <input name="size" type="text" />
              <input name="preferredLanguage" type="text" />
              <input name="website" type="text" />
              <textarea name="message" />
              <div data-netlify-recaptcha="true" />
            </form>
            <LeadForm formContent={site.contact.form} locale={locale} />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
