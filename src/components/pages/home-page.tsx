import Image from "next/image";
import Link from "next/link";

import { StructuredData } from "@/components/structured-data";
import { BlogCard } from "@/components/sections/blog-card";
import { CaseStudyCard } from "@/components/sections/case-study-card";
import { SectionHeading } from "@/components/sections/section-heading";
import { CTASection } from "@/components/sections/cta-section";
import { FAQSection } from "@/components/sections/faq-section";
import { Hero } from "@/components/sections/hero";
import { InteractiveSelector } from "@/components/sections/interactive-selector";
import { LatamMap } from "@/components/sections/latam-map";
import { LoyaltyFlow } from "@/components/sections/loyalty-flow";
import { ProductCard } from "@/components/sections/product-card";
import { StatsStrip } from "@/components/sections/stats-strip";
import { SiteShell } from "@/components/site-shell";
import { getLocalePrefix, getSeedCaseStudies, getSiteContent } from "@/lib/content";
import { getAllBlogPosts } from "@/lib/blog";
import type { Locale } from "@/lib/types";

export async function HomePage({ locale }: { locale: Locale }) {
  const [site, studies, blogPosts] = await Promise.all([
    getSiteContent(locale),
    getSeedCaseStudies(locale),
    getAllBlogPosts(locale)
  ]);
  const content = site.home;
  const localePrefix = getLocalePrefix(locale);
  const featuredCardImageOverrides: Record<string, string> = {
    "club-santa-lucia": "/images/case-studies/club-santa-lucia-home-v2.jpg",
    gamerleal: "/images/case-studies/gamerleal-home-v2.png"
  };
  const audienceSupport =
    locale === "en"
      ? [
          {
            title: "Acquire, retain, or reactivate",
            text: "Build programs for customers, buyers, partners, or internal teams without changing the operating core."
          },
          {
            title: "Adapt rules, rewards, and measurement",
            text: "Campaign logic, catalogs, and reporting can shift by audience, market, and business objective."
          }
        ]
      : [
          {
            title: "Activa recurrencia, volumen o desempeño",
            text: "Diseña programas para clientes, compradores, canales o equipos internos sin cambiar la base operativa."
          },
          {
            title: "Adapta reglas, rewards y medición",
            text: "La lógica de campañas, catálogos y reportes puede variar según audiencia, mercado y objetivo comercial."
          }
        ];
  const audiencePanelCaption =
    locale === "en"
      ? "One operating framework can flex by audience, market, and reward logic."
      : "Un mismo framework operativo puede adaptarse por audiencia, mercado y lógica de rewards.";
  const featuredOrder = ["directv-fans", "progra-mas", "club-santa-lucia", "gamerleal", "quito-motors", "tarjeta-gpf"];
  const featuredCases = featuredOrder
    .map((slug) => studies.find((study) => study.slug === slug))
    .filter(Boolean)
    .slice(0, 6);
  const latestPosts = blogPosts.slice(0, 3);
  const faqItems =
    locale === "en"
      ? [
          {
            question: "What exactly does Zegendia do?",
            answer:
              "Zegendia designs, implements, and operates loyalty, incentive, and rewards programs for companies of any size. We can help engage B2C customers, B2B buyers, distributors, sales teams, employees, partners, or communities. Today we do more than points programs: we build complete loyalty ecosystems with technology, rewards, logistics, gamification, and measurement."
          },
          {
            question: "Do I need an existing loyalty program to work with Zegendia?",
            answer:
              "No. We can help in two scenarios. If you already have a loyalty program, Oh My Rewards can connect to deliver real rewards across Latin America through one API. If you do not yet have a program, PuntosPlus lets you create one from scratch quickly, flexibly, and affordably."
          },
          {
            question: "Do I need to buy inventory or reward stock?",
            answer:
              "No. That is one of our biggest advantages. With Oh My Rewards, you do not need to buy products in advance, fill warehouses, negotiate with providers, or manage deliveries. We can handle the catalog, providers, physical products, gift cards, top-ups, deliveries, and tracking across different LATAM countries."
          },
          {
            question: "Can I deliver physical rewards, not just points or digital coupons?",
            answer:
              "Yes. Zegendia can operate physical rewards, digital gift cards, top-ups, premium products, corporate incentives, and custom catalogs. Oh My Rewards is designed specifically to solve the hardest part: turning points or benefits into real rewards delivered to the end user."
          },
          {
            question: "Is launching a loyalty program expensive?",
            answer:
              "Not necessarily. In the past, a loyalty program could require costly development, inventory, providers, logistics, and months of work. With PuntosPlus, the idea is that a business can start from an accessible plan, beginning around US$49 per month, and grow over time according to its needs."
          },
          {
            question: "How long does it take to launch a customized platform?",
            answer:
              "It depends on the level of customization, but today we can move much faster than before. With models such as PuntosPlus, a company can configure a base program very quickly. For cases with a clear structure of points, rewards, portal, and rules, an initial operating version can be available in a very short time, even around 48 hours if the scope is well defined."
          },
          {
            question: "Is PuntosPlus only for end customers?",
            answer:
              "No. That is one of the biggest differences. PuntosPlus is not limited to B2C customers. It can be used to motivate bakeries, hardware stores, distributors, sales reps, employees, commercial channels, partners, referrers, influencers, or communities. The system is built around a universal participant model, which makes it adaptable to many audience types."
          },
          {
            question: "What kind of company can use Zegendia?",
            answer:
              "From a small business to a large corporation. A restaurant, bakery, gym, retailer, distributor, fintech, bank, insurer, telco, e-commerce business, or any company with a sales force can use our solutions. The idea is simple: if there is a behavior you want to encourage, Zegendia can help turn it into points, benefits, rewards, or measurable incentives."
          },
          {
            question: "Can you create a program like Club Santa Lucía for my company?",
            answer:
              "Yes. Club Santa Lucía is an example of how a B2B company can reward customers based on purchases, volume, or commercial behavior. In that case, bakeries accumulate points through purchases and later redeem them for physical rewards. The platform includes a customer portal, admin panel, points rules, POS, gamification, logistics, billing, support, and reporting."
          },
          {
            question: "What makes Zegendia different from other loyalty platforms?",
            answer:
              "Zegendia does not only deliver software. We combine strategy, technology, rewards, logistics, regional LATAM experience, and real operational capability. We can create the program, connect it through APIs, operate the rewards, measure results, and scale it. In short: we do not just give you a platform; we help loyalty work in real life."
          }
        ]
      : [
          {
            question: "¿Qué hace Zegendia exactamente?",
            answer:
              "Zegendia diseña, implementa y opera programas de lealtad, incentivos y recompensas para empresas de cualquier tamaño. Podemos ayudar a fidelizar clientes B2C, compradores B2B, distribuidores, vendedores, empleados, aliados o comunidades. Hoy no solo hacemos programas de puntos: construimos ecosistemas completos de fidelización con tecnología, premios, logística, gamificación y medición."
          },
          {
            question: "¿Necesito tener ya un programa de lealtad para trabajar con Zegendia?",
            answer:
              "No. Podemos ayudarte en dos escenarios. Si ya tienes un programa de lealtad, Oh My Rewards puede conectarse para entregar premios reales en Latinoamérica mediante una sola API. Si todavía no tienes programa, PuntosPlus permite crear uno desde cero, de forma rápida, configurable y accesible."
          },
          {
            question: "¿Tengo que comprar inventario o stock de premios?",
            answer:
              "No. Esa es una de nuestras mayores ventajas. Con Oh My Rewards, no necesitas comprar productos por adelantado, llenar bodegas, negociar con proveedores ni manejar entregas. Nosotros podemos encargarnos del catálogo, proveedores, productos físicos, gift cards, recargas, entregas y tracking en diferentes países de LATAM."
          },
          {
            question: "¿Puedo entregar premios físicos, no solo puntos o cupones digitales?",
            answer:
              "Sí. Zegendia puede operar premios físicos, gift cards digitales, recargas, productos premium, incentivos corporativos y catálogos personalizados. Oh My Rewards está diseñado justamente para resolver la parte más difícil: convertir puntos o beneficios en premios reales entregados al usuario final."
          },
          {
            question: "¿Es muy caro lanzar un programa de lealtad?",
            answer:
              "No necesariamente. Antes, un programa de lealtad podía requerir desarrollo costoso, inventario, proveedores, logística y meses de trabajo. Con PuntosPlus, la idea es que una empresa pueda comenzar desde un plan accesible, desde aproximadamente US$49 al mes, y crecer según sus necesidades."
          },
          {
            question: "¿Cuánto tiempo toma lanzar una plataforma personalizada?",
            answer:
              "Depende del nivel de personalización, pero hoy podemos avanzar mucho más rápido que antes. Con modelos como PuntosPlus, una empresa puede configurar un programa base en muy poco tiempo. Para casos con una estructura clara de puntos, premios, portal y reglas, se puede tener una versión operativa inicial en tiempos muy cortos, incluso en alrededor de 48 horas si el alcance está bien definido."
          },
          {
            question: "¿PuntosPlus sirve solo para clientes finales?",
            answer:
              "No. Esa es la gran diferencia. PuntosPlus no está pensado solo para clientes B2C. Puede usarse para motivar panaderías, ferreterías, distribuidores, vendedores, empleados, canales comerciales, aliados, referidores, influencers o comunidades. El sistema se basa en un participante universal, lo que permite adaptar el programa a muchos tipos de audiencia."
          },
          {
            question: "¿Qué tipo de empresa puede usar Zegendia?",
            answer:
              "Desde una pequeña empresa hasta una gran corporación. Un restaurante, panadería, gimnasio, retail, distribuidor, fintech, banco, aseguradora, telco, e-commerce o empresa con fuerza comercial puede usar nuestras soluciones. La idea es simple: si hay una conducta que quieres incentivar, Zegendia puede ayudarte a convertirla en puntos, beneficios, premios o recompensas."
          },
          {
            question: "¿Pueden crear un programa como Club Santa Lucía para mi empresa?",
            answer:
              "Sí. Club Santa Lucía es un ejemplo de cómo una empresa B2B puede premiar a sus clientes por compras, volumen o comportamiento comercial. En ese caso, las panaderías acumulan puntos por compras y luego los canjean por premios físicos. La plataforma incluye portal del cliente, panel administrativo, reglas de puntos, POS, gamificación, logística, facturación, soporte y reportes."
          },
          {
            question: "¿Qué hace diferente a Zegendia frente a otras plataformas de lealtad?",
            answer:
              "Zegendia no solo entrega software. Integramos estrategia, tecnología, premios, logística, experiencia regional en LATAM y capacidad operativa real. Podemos crear el programa, conectarlo con APIs, operar los premios, medir resultados y escalarlo. En pocas palabras: no solo te damos una plataforma; te ayudamos a que la lealtad funcione en la vida real."
          }
        ];
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Zegendia",
      url: locale === "en" ? "https://www.zegendia.com/en" : "https://www.zegendia.com",
      logo: "https://www.zegendia.com/images/brand/zegendia-logo.png",
      description: site.meta.defaultDescription
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    }
  ];

  return (
    <SiteShell locale={locale} site={site}>
      <StructuredData data={structuredData} />
      <Hero
        accent="warm"
        ctas={content.hero.ctas}
        eyebrow={content.hero.eyebrow}
        locale={locale}
        proofStrip={content.hero.proofStrip}
        spotlight={content.hero.spotlight}
        text={content.hero.subheadline}
        title={content.hero.headline}
      />

      <StatsStrip items={content.stats} />

      <section className="section-space pt-10">
        <div className="container-shell">
          <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <SectionHeading
                accent="green"
                description={content.positioning.text}
                eyebrow={content.positioning.eyebrow}
                title={content.positioning.title}
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {audienceSupport.map((item) => (
                  <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5" key={item.title}>
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[560px] overflow-hidden rounded-[36px] border border-white/10 sm:min-h-[620px] lg:max-w-[520px] lg:justify-self-end">
              <div className="absolute inset-0">
                <Image
                  alt={locale === "en" ? "Audience activation background" : "Fondo de audiencias"}
                  className="object-cover object-center opacity-72"
                  fill
                  sizes="(max-width: 1024px) 100vw, 520px"
                  src="/images/sections/fondo-seccion.png"
                />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,22,0.94)_0%,rgba(4,8,22,0.74)_48%,rgba(4,8,22,0.92)_100%)]" />
              <div className="relative flex min-h-[560px] flex-col p-6 sm:min-h-[620px] sm:p-8 lg:p-10">
                <div className="text-xs uppercase tracking-[0.22em] text-[#b7e78c]">
                  {content.positioning.panelTitle ?? content.positioning.eyebrow}
                </div>
                <p className="mt-4 max-w-md text-base leading-8 text-slate-300">{audiencePanelCaption}</p>

                <div className="mt-8 flex-1 space-y-3">
                  {content.positioning.audiences.map((audience, index) => (
                    <div
                      className={`flex items-center gap-3 rounded-2xl border bg-[#07101f]/64 px-4 py-4 text-sm font-medium text-white backdrop-blur-sm ${
                        index % 3 === 0
                          ? "border-[#e44c44]/26"
                          : index % 3 === 1
                            ? "border-[#549c24]/24"
                            : "border-[#2e636b]/24"
                      }`}
                      key={audience}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          index % 3 === 0 ? "bg-[#e44c44]" : index % 3 === 1 ? "bg-[#549c24]" : "bg-[#2e636b]"
                        }`}
                      />
                      {audience}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space pt-10">
        <div className="container-shell">
          <SectionHeading
            accent="warm"
            eyebrow={locale === "en" ? "Product ecosystem" : "Ecosistema de productos"}
            title={
              locale === "en"
                ? "One ecosystem for custom strategy, regional rewards, and fast-launch loyalty software."
                : "Un ecosistema para estrategia custom, rewards regionales y software de loyalty listo para lanzar."
            }
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {content.productCards.map((card) => (
              <ProductCard card={card} key={card.name} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <InteractiveSelector
        accent="green"
        description={content.selector.description}
        eyebrow={content.selector.eyebrow}
        options={content.selector.options}
        title={content.selector.title}
      />

      <LoyaltyFlow accent="warm" eyebrow={content.flow.eyebrow} steps={content.flow.steps} title={content.flow.title} />

      <section className="section-space">
        <div className="container-shell">
          <SectionHeading
            accent="green"
            eyebrow={locale === "en" ? "Proof of capability" : "Prueba de capacidad"}
            title={
              locale === "en"
                ? "The portfolio matters because it proves Zegendia has already built real programs."
                : "El portfolio importa porque prueba que Zegendia ya ha construido programas reales."
            }
            description={
              locale === "en"
                ? "Historic cases from the WordPress site now live inside the new experience: customer loyalty, employee rewards, distributor programs, fulfillment operations, and vertical community cases."
                : "Casos históricos del WordPress ahora integrados en la nueva experiencia: loyalty para clientes, incentivos para empleados, programas de canal, fulfillment y verticales de comunidad."
            }
          />
          <div className="mt-10 grid gap-5 xl:grid-cols-3">
            {featuredCases.map((study) => (
              <CaseStudyCard
                client={study?.client}
                coverImage={study?.slug ? featuredCardImageOverrides[study.slug] ?? study.coverImage : study?.coverImage}
                href={`${localePrefix}/case-studies/${study?.slug}`}
                key={study?.slug}
                locale={locale}
                metrics={study?.metrics}
                summary={study?.summary ?? ""}
                tag={study?.sector ?? ""}
                title={study?.title ?? ""}
              />
            ))}
          </div>
          <div className="mt-8">
            <Link
              className="inline-flex items-center text-sm font-semibold text-[#78d5d7]"
              href={`${localePrefix}/case-studies`}
            >
              {locale === "en" ? "Explore the full portfolio" : "Explorar el portfolio completo"}
            </Link>
          </div>
        </div>
      </section>

      <LatamMap
        accent="warm"
        locale={locale}
        countries={content.latam.countries}
        eyebrow={content.latam.eyebrow}
        text={content.latam.text}
        title={content.latam.title}
      />

      <section className="section-space bg-white/[0.02]">
        <div className="container-shell">
          <SectionHeading
            accent="green"
            eyebrow={content.ai.eyebrow}
            title={content.ai.title}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {content.ai.bullets.map((bullet) => (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300" key={bullet}>
                {bullet}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-10 sm:pt-14">
        <div className="container-shell">
          <SectionHeading
            accent="warm"
            eyebrow={locale === "en" ? "Latest thinking" : "Últimas ideas"}
            title={
              locale === "en"
                ? "Three recent reads on loyalty, rewards, and operational execution."
                : "Tres lecturas recientes sobre loyalty, rewards y ejecución operativa."
            }
            description={
              locale === "en"
                ? "A quick view into the ideas, cases, and signals shaping how we design loyalty in LATAM."
                : "Una vista rápida a ideas, casos y señales que están moldeando cómo diseñamos loyalty en LATAM."
            }
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <BlogCard key={`${post.locale}-${post.slug}`} locale={locale} localePrefix={localePrefix} post={post} />
            ))}
          </div>
          <div className="mt-8">
            <Link className="inline-flex items-center text-sm font-semibold text-[#78d5d7]" href={`${localePrefix}/blog`}>
              {locale === "en" ? "Explore all posts" : "Explorar todos los artículos"}
            </Link>
          </div>
        </div>
      </section>

      <FAQSection
        accent="warm"
        eyebrow={locale === "en" ? "FAQ" : "Preguntas frecuentes"}
        items={faqItems}
        locale={locale}
        title={
          locale === "en"
            ? "Clear answers before launching loyalty, incentives, or rewards in LATAM."
            : "Respuestas claras antes de lanzar loyalty, incentivos o rewards en LATAM."
        }
      />

      <CTASection
        primary={content.cta.primary}
        primaryVariant="brandWarm"
        secondary={content.cta.secondary}
        secondaryVariant="brandGreen"
        text={content.cta.text}
        title={content.cta.title}
      />
    </SiteShell>
  );
}
