import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Boxes,
  CalendarClock,
  FileCheck2,
  Gauge,
  Headphones,
  Layers3,
  PackageCheck,
  Puzzle,
  RefreshCcw,
  Rocket,
  Route,
  ShieldCheck,
  Sparkles,
  Store,
  Trophy,
  Truck
} from "lucide-react";

import { StructuredData } from "@/components/structured-data";
import { CTASection } from "@/components/sections/cta-section";
import { SectionHeading } from "@/components/sections/section-heading";
import { SiteShell } from "@/components/site-shell";
import { LinkButton } from "@/components/ui/button";
import { getSiteContent, getProductsContent } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

type ProductKey = "ohMyRewards" | "puntosPlus";

export async function ProductDetailPage({
  locale,
  productKey
}: {
  locale: Locale;
  productKey: ProductKey;
}) {
  const [site, products] = await Promise.all([getSiteContent(locale), getProductsContent(locale)]);
  const content = products[productKey] as Record<string, unknown>;
  const hero = content.hero as { eyebrow: string; title: string; text: string };
  const cta = content.cta as {
    title: string;
    text: string;
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
  };
  const localePrefix = locale === "en" ? "/en" : "";

  const productConfig =
    productKey === "ohMyRewards"
      ? {
          accent: "warm" as const,
          accentText: "text-[#ffb0aa]",
          accentLine: "bg-gradient-to-r from-[#e44c44] via-[#ff8a83] to-transparent",
          accentDot: "bg-[#e44c44]",
          logo: "/images/brand/oh-2.svg",
          logoWidth: "w-[170px]",
          logoSizes: "170px",
          platform: "https://app.ohmyrewards.com",
          badge: "API + fulfillment",
          backHref: `${localePrefix}/products`,
          backLabel: locale === "en" ? "Back to products" : "Volver a productos",
          platformLabel: locale === "en" ? "Open platform" : "Abrir plataforma",
          contactLabel: locale === "en" ? "Talk to the team" : "Hablar con el equipo",
          heroPanelTitle:
            locale === "en"
              ? "What Oh My Rewards actually does"
              : "Lo que Oh My Rewards realmente hace",
          heroPanelItems:
            locale === "en"
              ? [
                  "Your program keeps its own points, miles, cashback, or credits. Oh My Rewards turns that value into real rewards.",
                  "Your team controls catalog, orders, reports, support, and billing from a tenant portal.",
                  "Zegendia operates providers, logistics, incidents, claims, and reconciliation under an agreed SLA."
                ]
              : [
                  "Tu programa conserva sus puntos, millas, cashback o créditos. Oh My Rewards convierte ese valor en premios reales.",
                  "Tu equipo controla catálogo, órdenes, reportes, soporte y facturación desde un portal tenant.",
                  "Zegendia opera proveedores, logística, incidencias, reclamos y conciliación bajo un SLA acordado."
                ],
          useCasesTitle:
            locale === "en"
              ? "Built for companies that already have loyalty, cashback, or points."
              : "Diseñado para compañías que ya tienen loyalty, cashback o puntos.",
          useCasesText:
            locale === "en"
              ? "Oh My Rewards is not another points system. It is the regional fulfillment layer that turns accumulated value into real rewards delivered in Latin America."
              : "Oh My Rewards no es otro sistema de puntos. Es la capa regional de fulfillment que convierte valor acumulado en premios reales entregados en Latinoamérica.",
          useCases:
            locale === "en"
              ? [
                  "Banks and card rewards platforms",
                  "Fintech apps with cashback or benefits",
                  "Retail, ecommerce, and CRM rewards programs",
                  "Employee incentive and channel programs"
                ]
              : [
                  "Bancos y plataformas de banca de puntos",
                  "Apps fintech con cashback o beneficios",
                  "Programas de rewards en retail, ecommerce y CRM",
                  "Incentivos para empleados y canales comerciales"
                ],
          journeyTitle:
            locale === "en"
              ? "How the operating flow works"
              : "Cómo funciona el flujo operativo",
          journey:
            locale === "en"
              ? [
                  "Your program sends a redemption request through the API.",
                  "Oh My Rewards routes the order to the right catalog and provider.",
                  "Zegendia executes delivery, tracking, support, and issue management.",
                  "Your team receives visibility, reports, and consolidated monthly billing."
                ]
              : [
                  "Tu programa envía una solicitud de canje por API.",
                  "Oh My Rewards enruta la orden al catálogo y proveedor correctos.",
                  "Zegendia ejecuta entrega, tracking, soporte y manejo de incidencias.",
                  "Tu equipo recibe visibilidad, reportes y facturación mensual consolidada."
                ]
        }
      : {
          accent: "green" as const,
          accentText: "text-[#b7e78c]",
          accentLine: "bg-gradient-to-r from-[#549c24] via-[#8ed85d] to-transparent",
          accentDot: "bg-[#549c24]",
          logo: "/images/brand/puntosplus-logo-white.png",
          logoWidth: "w-[240px]",
          logoSizes: "240px",
          platform: "https://puntosplus.com",
          badge: locale === "en" ? "Loyalty software" : "Software de loyalty",
          backHref: `${localePrefix}/products`,
          backLabel: locale === "en" ? "Back to products" : "Volver a productos",
          platformLabel: locale === "en" ? "Go to PuntosPlus" : "Ir a PuntosPlus",
          contactLabel: locale === "en" ? "Talk to the team" : "Hablar con el equipo",
          heroPanelTitle:
            locale === "en"
              ? "What PuntosPlus actually gives you"
              : "Lo que PuntosPlus realmente te da",
          heroPanelItems:
            locale === "en"
              ? [
                  "One engine can motivate customers, B2B buyers, channels, sales teams, employees, affiliates, and communities.",
                  "The wizard translates eight business decisions into audiences, rules, currencies, rewards, portals, and dashboards.",
                  "Templates are configuration, not hardcoded verticals, so a bakery, retailer, dealer network, or sales team can launch from the same core."
                ]
              : [
                  "Un solo motor puede motivar clientes, compradores B2B, canales, equipos comerciales, empleados, afiliados y comunidades.",
                  "El wizard traduce ocho decisiones de negocio en audiencias, reglas, monedas, premios, portales y dashboards.",
                  "Las plantillas son configuración, no verticales hardcodeadas: una panadería, retailer, red de dealers o fuerza comercial salen del mismo core."
                ],
          useCasesTitle:
            locale === "en"
              ? "One engine, many business models."
              : "Un solo motor, muchos modelos de negocio.",
          useCasesText:
            locale === "en"
              ? "PuntosPlus is not limited to customer points programs. It can adapt to loyalty, incentives, sales enablement, channel motivation, and internal engagement programs."
              : "PuntosPlus no está limitado a programas de puntos para clientes. Puede adaptarse a loyalty, incentivos, activación comercial, motivación de canales y engagement interno.",
          useCases:
            locale === "en"
              ? (content.whoFor as string[])
              : (content.whoFor as string[]),
          journeyTitle:
            locale === "en"
              ? "How a program gets launched"
              : "Cómo se lanza un programa",
          journey:
            locale === "en"
              ? [
                  "Define the audience you want to motivate.",
                  "Configure behaviors, currency, rules, and rewards without coding.",
                  "Publish the experience with the right portal, campaigns, and catalog.",
                  "Measure activation, redemptions, repeat behavior, and program growth."
                ]
              : [
                  "Define la audiencia que quieres motivar.",
                  "Configura comportamientos, moneda, reglas y rewards sin código.",
                  "Publica la experiencia con el portal, campañas y catálogo adecuados.",
                  "Mide activación, redenciones, recurrencia y crecimiento del programa."
                ]
        };

  const isOhMyRewards = productKey === "ohMyRewards";
  const isPuntosPlus = productKey === "puntosPlus";
  const omrEvolution =
    locale === "en"
      ? [
          {
            label: "Before",
            title: "Reward administration depended on requests, files, and operational follow-up.",
            text: "Catalog changes, provider coordination, claims, reporting, and reconciliation usually required back-and-forth with an operations team."
          },
          {
            label: "Now",
            title: "The client can control the reward operation online, instantly.",
            text: "Each tenant can select, remove, pause, activate, and monitor rewards from the portal, while Zegendia keeps operating fulfillment behind the scenes."
          },
          {
            label: "What changed",
            title: "The service became a platform without losing the managed operation.",
            text: "Oh My Rewards combines self-service software, one API, local providers, support tickets, order visibility, and consolidated billing."
          }
        ]
      : [
          {
            label: "Antes",
            title: "La administración de premios dependía de solicitudes, archivos y seguimiento operativo.",
            text: "Cambiar catálogos, coordinar proveedores, manejar reclamos, reportar y conciliar requería mucho ida y vuelta con operación."
          },
          {
            label: "Ahora",
            title: "El cliente puede controlar la operación de premios en línea, al instante.",
            text: "Cada tenant puede escoger, quitar, pausar, activar y monitorear premios desde el portal, mientras Zegendia sigue operando el fulfillment detrás."
          },
          {
            label: "Lo que cambió",
            title: "El servicio se convirtió en plataforma sin perder la operación administrada.",
            text: "Oh My Rewards combina software self-service, una API, proveedores locales, tickets de soporte, visibilidad de órdenes y facturación consolidada."
          }
        ];

  const omrBenefitFlow =
    locale === "en"
      ? [
          {
            label: "Catalog control",
            title: "Choose what each program can redeem, without manual changes.",
            pain: "Pain solved: product changes by country, category, campaign, or stock used to depend on slow operational requests.",
            gain: "Client gain: activate, remove, pause, or curate rewards online with clearer control over availability and program economics.",
            image: "/images/products/oh-my-rewards/catalog.png",
            accent: "warm"
          },
          {
            label: "Order visibility",
            title: "Know what happened after the redemption, from order to delivery.",
            pain: "Pain solved: users redeem a reward and the company has to chase delivery status, tracking, provider updates, and exceptions.",
            gain: "Client gain: order status, recipient, item, tracking, carrier, amount, and dates stay visible in one place.",
            image: "/images/products/oh-my-rewards/orders.png",
            accent: "cyan"
          },
          {
            label: "Executive control",
            title: "See fulfillment performance before it becomes a problem.",
            pain: "Pain solved: teams often discover issues too late, when users complain or finance asks for explanations.",
            gain: "Client gain: live KPIs for delivery rate, pending orders, processing time, failed orders, and total spend.",
            image: "/images/products/oh-my-rewards/dashboard.png",
            accent: "green"
          },
          {
            label: "Support traceability",
            title: "Turn incidents into trackable tickets, not WhatsApp chaos.",
            pain: "Pain solved: technical questions, catalog gaps, billing differences, and order incidents get lost across channels.",
            gain: "Client gain: every case has priority, status, category, history, and owner for cleaner SLA follow-up.",
            image: "/images/products/oh-my-rewards/support.png",
            accent: "purple"
          }
        ]
      : [
          {
            label: "Control del catálogo",
            title: "Escoger qué puede canjear cada programa, sin cambios manuales.",
            pain: "Dolor que resuelve: cambiar productos por país, categoría, campaña o disponibilidad antes dependía de solicitudes operativas lentas.",
            gain: "Lo que gana el cliente: activar, quitar, pausar o curar premios en línea, con mayor control sobre disponibilidad y economía del programa.",
            image: "/images/products/oh-my-rewards/catalog.png",
            accent: "warm"
          },
          {
            label: "Visibilidad de órdenes",
            title: "Saber qué pasó después del canje, desde la orden hasta la entrega.",
            pain: "Dolor que resuelve: el usuario canjea y la empresa tiene que perseguir estados de entrega, tracking, proveedor y excepciones.",
            gain: "Lo que gana el cliente: estado, destinatario, artículo, guía, carrier, monto y fecha visibles en un solo lugar.",
            image: "/images/products/oh-my-rewards/orders.png",
            accent: "cyan"
          },
          {
            label: "Control ejecutivo",
            title: "Ver el desempeño del fulfillment antes de que se vuelva un problema.",
            pain: "Dolor que resuelve: muchos equipos se enteran tarde de los problemas, cuando el usuario reclama o finanzas pide explicaciones.",
            gain: "Lo que gana el cliente: KPIs vivos de tasa de entrega, órdenes pendientes, tiempo de proceso, órdenes fallidas y gasto total.",
            image: "/images/products/oh-my-rewards/dashboard.png",
            accent: "green"
          },
          {
            label: "Soporte trazable",
            title: "Convertir incidencias en tickets, no en caos de WhatsApp.",
            pain: "Dolor que resuelve: preguntas técnicas, faltantes de catálogo, diferencias de facturación e incidencias de órdenes se pierden entre canales.",
            gain: "Lo que gana el cliente: cada caso tiene prioridad, estado, categoría, historial y responsable para dar seguimiento al SLA.",
            image: "/images/products/oh-my-rewards/support.png",
            accent: "purple"
          }
        ];

  const omrOperationalPromise =
    locale === "en"
      ? [
          {
            value: "Thousands",
            label: "Physical and digital rewards",
            text: "Market-priced products, gift cards, top-ups, premium rewards, and sourcing by campaign."
          },
          {
            value: "Online",
            label: "Catalog control",
            text: "Activate, remove, pause, or curate products by country, category, campaign, or audience."
          },
          {
            value: "1 year",
            label: "Price stability",
            text: "Freeze selected prices to reduce points volatility inside the client program."
          },
          {
            value: "LATAM",
            label: "Managed operation",
            text: "Providers, fulfillment, support, incidents, reports, and reconciliation under one model."
          }
        ]
      : [
          {
            value: "Miles",
            label: "Premios físicos y digitales",
            text: "Productos a precio de mercado, gift cards, recargas, premios premium y sourcing por campaña."
          },
          {
            value: "Online",
            label: "Control del catálogo",
            text: "Activa, quita, pausa o cura productos por país, categoría, campaña o audiencia."
          },
          {
            value: "1 año",
            label: "Estabilidad de precios",
            text: "Precios seleccionados congelables para reducir variabilidad de puntos."
          },
          {
            value: "LATAM",
            label: "Operación administrada",
            text: "Proveedores, fulfillment, soporte, incidencias, reportes y conciliación bajo un solo modelo."
          }
        ];

  const omrSlaMetrics =
    locale === "en"
      ? [
          {
            icon: Truck,
            value: "8 days",
            label: "Maximum delivery promise",
            text: "Physical rewards can be operated under a maximum delivery commitment, with escalation when a route or provider needs attention."
          },
          {
            icon: PackageCheck,
            value: "80%",
            label: "Physical rewards in 48h",
            text: "Most physical products can be delivered within the first 48 hours when stock and delivery conditions are available."
          },
          {
            icon: RefreshCcw,
            value: "48h",
            label: "Claim window",
            text: "Damage or quality issues reported within the agreed window can trigger replacement management."
          },
          {
            icon: BadgeCheck,
            value: "1 error / 100",
            label: "Fulfillment accuracy",
            text: "The operation is designed to minimize wrong items, wrong denominations, and shipping defects."
          },
          {
            icon: ShieldCheck,
            value: "1 day",
            label: "Incident resolution path",
            text: "Fulfillment errors or availability issues can be acknowledged and routed quickly with a clear owner."
          },
          {
            icon: FileCheck2,
            value: "2 days",
            label: "Proof of delivery",
            text: "When a delivery dispute happens, proof of delivery can be requested with recipient, reference, signature, and date."
          },
          {
            icon: Headphones,
            value: "3 attempts",
            label: "Recipient follow-up",
            text: "Undeliverable orders can be followed up through phone or email before escalation or cancellation."
          },
          {
            icon: CalendarClock,
            value: "Day 5",
            label: "Monthly billing report",
            text: "Consumption and billing reporting can be consolidated early each month for review and reconciliation."
          }
        ]
      : [
          {
            icon: Truck,
            value: "8 días",
            label: "Promesa máxima de entrega",
            text: "Los premios físicos pueden operarse bajo una promesa máxima de entrega, con escalamiento cuando una ruta o proveedor requiere atención."
          },
          {
            icon: PackageCheck,
            value: "80%",
            label: "Premios físicos en 48h",
            text: "La mayoría de productos físicos puede entregarse en las primeras 48 horas cuando hay stock y condiciones de entrega."
          },
          {
            icon: RefreshCcw,
            value: "48h",
            label: "Ventana de reclamo",
            text: "Daños o problemas de calidad reportados dentro de la ventana acordada pueden activar gestión de reposición."
          },
          {
            icon: BadgeCheck,
            value: "1 error / 100",
            label: "Precisión de fulfillment",
            text: "La operación está diseñada para reducir artículos incorrectos, denominaciones equivocadas y defectos de envío."
          },
          {
            icon: ShieldCheck,
            value: "1 día",
            label: "Ruta de resolución",
            text: "Errores de fulfillment o problemas de disponibilidad pueden reconocerse y enrutar rápidamente con responsable claro."
          },
          {
            icon: FileCheck2,
            value: "2 días",
            label: "Prueba de entrega",
            text: "Ante una disputa de entrega, se puede solicitar respaldo con destinatario, referencia, firma y fecha de recepción."
          },
          {
            icon: Headphones,
            value: "3 intentos",
            label: "Seguimiento al destinatario",
            text: "Las órdenes no entregables pueden gestionarse por teléfono o email antes de escalar o cancelar el caso."
          },
          {
            icon: CalendarClock,
            value: "Día 5",
            label: "Reporte mensual",
            text: "El consumo y la facturación pueden consolidarse al inicio de cada mes para revisión y conciliación."
          }
        ];

  const omrCountries = "countries" in content ? (content.countries as string[]) : [];

  const puntosPower =
    locale === "en"
      ? [
          {
            icon: Sparkles,
            value: "30 min",
            title: "From idea to draft program",
            text: "The onboarding wizard turns business answers into a ready-to-configure loyalty program."
          },
          {
            icon: Layers3,
            value: "8",
            title: "Reusable primitives",
            text: "Audience, behavior, currency, rule, reward, control, experience, and measurement."
          },
          {
            icon: Route,
            value: "Any audience",
            title: "Universal participant",
            text: "The same model can represent a customer, company buyer, reseller, employee, seller, affiliate, or ally."
          }
        ]
      : [
          {
            icon: Sparkles,
            value: "30 min",
            title: "De idea a programa borrador",
            text: "El onboarding convierte respuestas de negocio en un programa de lealtad listo para configurar."
          },
          {
            icon: Layers3,
            value: "8",
            title: "Primitivas reutilizables",
            text: "Audiencia, comportamiento, moneda, regla, recompensa, control, experiencia y medición."
          },
          {
            icon: Route,
            value: "Cualquier audiencia",
            title: "Participante universal",
            text: "El mismo modelo representa cliente, empresa compradora, reseller, empleado, vendedor, afiliado o aliado."
          }
        ];

  const puntosWizardSteps =
    locale === "en"
      ? [
          "Who do you want to motivate?",
          "What behavior should change?",
          "What value will they accumulate?",
          "What rewards can they redeem?",
          "What rules, limits, and approvals apply?",
          "How many branches, teams, or countries?",
          "What experience should each actor see?",
          "What KPIs prove the program is working?"
        ]
      : [
          "¿A quién quieres motivar?",
          "¿Qué conducta quieres mover?",
          "¿Qué valor van a acumular?",
          "¿Qué premios podrán canjear?",
          "¿Qué reglas, límites y aprobaciones aplican?",
          "¿Cuántas sucursales, equipos o países?",
          "¿Qué experiencia verá cada actor?",
          "¿Qué KPIs prueban que funciona?"
        ];

  const puntosTemplates =
    locale === "en"
      ? [
          { icon: Store, title: "Retail B2C", text: "Points, stamps, referrals, birthdays, and repeat purchase for restaurants, pharmacies, gyms, and stores." },
          { icon: Boxes, title: "B2B distribution", text: "Company buyers, volume, on-time payment, tiers, physical rewards, and consolidated billing." },
          { icon: Trophy, title: "Channels and dealers", text: "Sell-in, sell-out, training, displays, rankings, and incentives for dealer networks." },
          { icon: Gauge, title: "Sales teams", text: "Quotas, strategic products, new accounts, leaderboards, badges, and internal rewards." },
          { icon: ShieldCheck, title: "Employees and culture", text: "Peer recognition, training, values, anniversaries, wellness, and HR dashboards." },
          { icon: Puzzle, title: "Community and advocacy", text: "Referrals, content, events, ambassadors, badges, and community challenges." }
        ]
      : [
          { icon: Store, title: "Retail B2C", text: "Puntos, sellos, referidos, cumpleaños y recompra para restaurantes, farmacias, gimnasios y tiendas." },
          { icon: Boxes, title: "Distribución B2B", text: "Compradores empresa, volumen, pago puntual, tiers, premios físicos y facturación consolidada." },
          { icon: Trophy, title: "Canales y dealers", text: "Sell-in, sell-out, capacitación, exhibición, rankings e incentivos para redes comerciales." },
          { icon: Gauge, title: "Fuerza comercial", text: "Cuotas, productos estratégicos, nuevos clientes, rankings, badges y recompensas internas." },
          { icon: ShieldCheck, title: "Empleados y cultura", text: "Reconocimiento entre pares, capacitación, valores, aniversarios, bienestar y dashboards de RRHH." },
          { icon: Puzzle, title: "Comunidad y advocacy", text: "Referidos, contenido, eventos, embajadores, insignias y retos para comunidades." }
        ];

  const puntosOperatingLayer =
    locale === "en"
      ? [
          { icon: Rocket, title: "No-code launch", text: "The template creates the program, initial rules, portal, catalog logic, and checklist." },
          { icon: BadgeCheck, title: "Rules engine", text: "Multipliers, caps, approvals, expiration, anti-fraud, tiers, and promotions without custom development." },
          { icon: FileCheck2, title: "Ledger and wallet", text: "Every point, coin, stamp, badge, cashback, or credit movement is traceable." },
          { icon: BarChart3, title: "Real measurement", text: "Activation, redemption, repeat behavior, liabilities, ROI, campaign lift, and exports." }
        ]
      : [
          { icon: Rocket, title: "Lanzamiento sin código", text: "La plantilla crea programa, reglas iniciales, portal, lógica de catálogo y checklist." },
          { icon: BadgeCheck, title: "Motor de reglas", text: "Multiplicadores, topes, aprobaciones, expiración, antifraude, tiers y promociones sin desarrollo custom." },
          { icon: FileCheck2, title: "Ledger y wallet", text: "Cada punto, coin, sello, badge, cashback o crédito queda trazable." },
          { icon: BarChart3, title: "Medición real", text: "Activación, canje, recurrencia, pasivo, ROI, lift de campañas y exportes." }
        ];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": productKey === "puntosPlus" ? "SoftwareApplication" : "Product",
    name: hero.title,
    description: hero.text,
    applicationCategory: productKey === "puntosPlus" ? "BusinessApplication" : undefined,
    brand: {
      "@type": "Brand",
      name: "Zegendia"
    }
  };

  return (
    <SiteShell locale={locale} site={site}>
      <StructuredData data={productSchema} />

      <section className="section-space pb-14">
        <div className="container-shell">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
            href={productConfig.backHref}
          >
            <ArrowLeft className="h-4 w-4" />
            {productConfig.backLabel}
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-stretch">
            <div className="flex flex-col justify-center">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{hero.eyebrow}</div>
              <div className={`relative mt-5 h-12 ${productConfig.logoWidth}`}>
                <Image alt={hero.title} className="object-contain object-left" fill sizes={productConfig.logoSizes} src={productConfig.logo} />
              </div>
              <div className={cn("mt-6 text-xs uppercase tracking-[0.22em]", productConfig.accentText)}>{productConfig.badge}</div>
              <h1 className="headline-balance mt-4 max-w-4xl font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                {hero.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">{hero.text}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton
                  href={productConfig.platform}
                  size="lg"
                  variant={productKey === "ohMyRewards" ? "brandWarm" : "brandGreen"}
                >
                  {productConfig.platformLabel}
                </LinkButton>
                <LinkButton href={`${localePrefix}/contact`} size="lg" variant="secondary">
                  {productConfig.contactLabel}
                </LinkButton>
              </div>

              {"highlights" in content ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  {(content.highlights as string[]).map((item) => (
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative overflow-hidden rounded-[40px] border border-white/10 min-h-[520px]">
              <div className="absolute inset-0">
                <Image
                  alt={locale === "en" ? "Product visual background" : "Fondo visual del producto"}
                  className="object-cover object-bottom"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src="/images/products/products-spectrum-wave.png"
                />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,22,0.94)_0%,rgba(6,10,22,0.72)_38%,rgba(6,10,22,0.94)_100%)]" />
              <div className="relative flex min-h-[520px] flex-col justify-between p-7 sm:p-8">
                <div>
                  <div className={cn("text-xs uppercase tracking-[0.22em]", productConfig.accentText)}>
                    {productConfig.heroPanelTitle}
                  </div>
                  <div className={cn("mt-4 h-px w-24", productConfig.accentLine)} />
                </div>

                <div className="space-y-5">
                  {productConfig.heroPanelItems.map((item) => (
                    <div className="flex items-start gap-4 rounded-[24px] border border-white/10 bg-[#081120]/68 px-5 py-4 backdrop-blur-sm" key={item}>
                      <span className={cn("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", productConfig.accentDot)} />
                      <p className="text-sm leading-7 text-slate-200 sm:text-base">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <SectionHeading
              accent={productConfig.accent}
              eyebrow={locale === "en" ? "Use cases" : "Casos de uso"}
              title={productConfig.useCasesTitle}
              description={productConfig.useCasesText}
            />
          </div>

          <div className="space-y-6">
            {productConfig.useCases.map((item, index) => (
              <div className="grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-[80px_1fr] sm:gap-6" key={item}>
                <div className={cn("text-xs font-semibold uppercase tracking-[0.22em]", productConfig.accentText)}>
                  0{index + 1}
                </div>
                <div className="text-base leading-8 text-slate-300">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isPuntosPlus ? (
        <section className="section-space pt-0">
          <div className="container-shell">
            <SectionHeading
              accent="green"
              eyebrow={locale === "en" ? "The big idea" : "La gran idea"}
              title={
                locale === "en"
                  ? "A loyalty system for anything you need to move."
                  : "Un sistema de lealtad para mover cualquier conducta que te importe."
              }
              description={
                locale === "en"
                  ? "PuntosPlus is not a customer-points app. It is a configurable loyalty operating system: choose the audience, define the behavior, assign value, set rules, connect rewards, control risk, launch the experience, and measure the result."
                  : "PuntosPlus no es una app de puntos para clientes. Es un loyalty operating system configurable: eliges la audiencia, defines la conducta, asignas valor, configuras reglas, conectas premios, controlas riesgo, lanzas la experiencia y mides el resultado."
              }
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {puntosPower.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.025)_100%)] p-6"
                    key={item.title}
                  >
                    <div
                      className={cn(
                        "absolute inset-x-0 top-0 h-1",
                        index === 0 ? "bg-[#549c24]" : index === 1 ? "bg-[#2e636b]" : "bg-[#e44c44]"
                      )}
                    />
                    <div className="flex items-start justify-between gap-5">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]",
                          index === 0 ? "text-[#b7e78c]" : index === 1 ? "text-[#9de1e3]" : "text-[#ffb0aa]"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-right font-display text-3xl font-semibold text-white">{item.value}</div>
                    </div>
                    <h3 className="mt-6 font-display text-2xl font-semibold leading-tight text-white">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {isPuntosPlus ? (
        <section className="section-space pt-0">
          <div className="container-shell grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div>
              <SectionHeading
                accent="green"
                eyebrow={locale === "en" ? "Wizard-led launch" : "Lanzamiento guiado"}
                title={locale === "en" ? "The questionnaire is the product." : "El cuestionario es el producto."}
                description={
                  locale === "en"
                    ? "A business owner should not need to understand loyalty architecture. The wizard asks the right questions and turns the answers into a draft program with sensible defaults."
                    : "Un dueño de negocio no debería entender arquitectura de loyalty. El wizard hace las preguntas correctas y convierte las respuestas en un programa borrador con valores iniciales sensatos."
                }
              />

              <div className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.03] p-6">
                <div className="font-display text-5xl font-semibold text-[#b7e78c]">30 min</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {locale === "en"
                    ? "Target time from signup to first functional program: audience, currency, base rules, rewards, portal, and KPIs."
                    : "Tiempo objetivo desde el signup hasta el primer programa funcional: audiencia, moneda, reglas base, premios, portal y KPIs."}
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_20%_10%,rgba(84,156,36,0.22),transparent_30%),radial-gradient(circle_at_90%_65%,rgba(46,99,107,0.22),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.055)_0%,rgba(255,255,255,0.025)_100%)] p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {puntosWizardSteps.map((step, index) => (
                  <div className="rounded-[24px] border border-white/10 bg-[#07101d]/72 p-4" key={step}>
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                          index % 4 === 0 ? "bg-[#549c24]" : index % 4 === 1 ? "bg-[#2e636b]" : index % 4 === 2 ? "bg-[#e44c44]" : "bg-[#3d284c]"
                        )}
                      >
                        {index + 1}
                      </div>
                      <p className="text-sm leading-6 text-slate-200">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {isPuntosPlus ? (
        <section className="section-space pt-0">
          <div className="container-shell">
            <SectionHeading
              accent="green"
              eyebrow={locale === "en" ? "Template catalog" : "Catálogo de plantillas"}
              title={
                locale === "en"
                  ? "Different verticals, same engine."
                  : "Verticales distintas, el mismo motor."
              }
              description={
                locale === "en"
                  ? "The power of PuntosPlus is that templates are configuration, not code. A new industry should not require rebuilding the core."
                  : "El poder de PuntosPlus está en que las plantillas son configuración, no código. Una nueva industria no debería obligar a reconstruir el core."
              }
            />

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {puntosTemplates.map((template, index) => {
                const Icon = template.icon;

                return (
                  <div className="group border-t border-white/10 pt-6" key={template.title}>
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]",
                          index % 4 === 0
                            ? "text-[#b7e78c]"
                            : index % 4 === 1
                              ? "text-[#9de1e3]"
                              : index % 4 === 2
                                ? "text-[#ffb0aa]"
                                : "text-[#d4b7e7]"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-2xl font-semibold leading-tight text-white">{template.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-300">{template.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {isPuntosPlus ? (
        <section className="section-space pt-0">
          <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionHeading
                accent="green"
                eyebrow={locale === "en" ? "Operating layer" : "Capa operativa"}
                title={
                  locale === "en"
                    ? "Not just features. The system runs the program."
                    : "No son solo features. El sistema opera el programa."
                }
                description={
                  locale === "en"
                    ? "Behind the simple launch there is a serious engine: events, rules, wallets, ledgers, approvals, fraud controls, rewards, portals, and measurement."
                    : "Detrás del lanzamiento simple hay un motor serio: eventos, reglas, wallets, ledger, aprobaciones, control antifraude, premios, portales y medición."
                }
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {puntosOperatingLayer.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055)_0%,rgba(255,255,255,0.025)_100%)] p-5"
                    key={item.title}
                  >
                    <div className={cn("absolute inset-x-0 top-0 h-1", index % 2 === 0 ? "bg-[#549c24]" : "bg-[#2e636b]")} />
                    <Icon className={cn("h-6 w-6", index % 2 === 0 ? "text-[#b7e78c]" : "text-[#9de1e3]")} />
                    <h3 className="mt-5 font-display text-2xl font-semibold leading-tight text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {isOhMyRewards ? (
        <section className="section-space pt-0">
          <div className="container-shell">
            <SectionHeading
              accent="warm"
              eyebrow={locale === "en" ? "From service to platform" : "Del servicio a la plataforma"}
              title={
                locale === "en"
                  ? "The old reward operation, upgraded into tenant-controlled fulfillment."
                  : "La administración de premios de siempre, convertida en una operación controlable por cada tenant."
              }
              description={
                locale === "en"
                  ? "Zegendia already knew how to operate catalogs, providers, claims, logistics, and reconciliation. Oh My Rewards adds the layer clients were missing: immediate online control."
                  : "Zegendia ya sabía operar catálogos, proveedores, reclamos, logística y conciliación. Oh My Rewards suma la capa que faltaba: control inmediato en línea para el cliente."
              }
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {omrEvolution.map((item, index) => (
                <div
                  className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055)_0%,rgba(255,255,255,0.025)_100%)] p-6"
                  key={item.label}
                >
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 h-1",
                      index === 0
                        ? "bg-[#3d284c]"
                        : index === 1
                          ? "bg-gradient-to-r from-[#e44c44] via-[#2e636b] to-[#549c24]"
                          : "bg-[#549c24]"
                    )}
                  />
                  <div className={cn("text-xs uppercase tracking-[0.22em]", index === 1 ? productConfig.accentText : "text-slate-400")}>
                    {item.label}
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {isOhMyRewards ? (
        <section className="section-space pt-0">
          <div className="container-shell">
            <SectionHeading
              accent="warm"
              eyebrow={locale === "en" ? "What the client gains" : "Lo que gana el cliente"}
              title={
                locale === "en"
                  ? "Every feature exists to remove an operational pain."
                  : "Cada función existe para quitar un dolor operativo."
              }
              description={
                locale === "en"
                  ? "These screens show where the client gains control: catalog, orders, KPIs, and support without depending on manual follow-up."
                  : "Estas pantallas muestran dónde el cliente gana control: catálogo, órdenes, KPIs y soporte sin depender de seguimiento manual."
              }
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {omrBenefitFlow.map((item, index) => (
                <article
                  className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.025)_100%)] p-5 shadow-2xl shadow-black/10"
                  key={item.label}
                >
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 h-1",
                      item.accent === "warm"
                        ? "bg-[#e44c44]"
                        : item.accent === "green"
                          ? "bg-[#549c24]"
                          : item.accent === "purple"
                            ? "bg-[#3d284c]"
                            : "bg-[#2e636b]"
                    )}
                  />
                  <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/[0.04] blur-2xl transition-opacity group-hover:opacity-80" />

                  <div className="relative flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full",
                              item.accent === "warm"
                                ? "bg-[#e44c44]"
                                : item.accent === "green"
                                  ? "bg-[#549c24]"
                                  : item.accent === "purple"
                                    ? "bg-[#3d284c]"
                                    : "bg-[#2e636b]"
                            )}
                          />
                          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{item.label}</div>
                        </div>
                        <div className="font-display text-sm text-slate-600">0{index + 1}</div>
                      </div>
                      <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-white md:text-3xl">
                        {item.title}
                      </h3>
                    </div>

                    <div className="mt-6 grid gap-4">
                      <div className="rounded-[22px] border border-white/10 bg-[#07101d]/70 p-4">
                        <div className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-500">
                          {locale === "en" ? "Pain solved" : "Dolor que resuelve"}
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{item.pain.replace(/^Pain solved: |^Dolor que resuelve: /, "")}</p>
                      </div>
                      <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
                        <div
                          className={cn(
                            "text-[0.68rem] uppercase tracking-[0.2em]",
                            item.accent === "warm"
                              ? productConfig.accentText
                              : item.accent === "green"
                                ? "text-[#b7e78c]"
                                : item.accent === "purple"
                                  ? "text-[#d4b7e7]"
                                  : "text-[#9de1e3]"
                          )}
                        >
                          {locale === "en" ? "Client gain" : "Lo que gana el cliente"}
                        </div>
                        <p className="mt-2 text-sm leading-7 text-white">{item.gain.replace(/^Client gain: |^Lo que gana el cliente: /, "")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-white p-2 shadow-2xl shadow-black/25">
                    <div className="absolute bottom-5 right-5 z-10 rounded-full border border-[#549c24]/25 bg-[#549c24]/80 px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white/90 shadow-sm backdrop-blur">
                      {locale === "en" ? "Tenant portal" : "Portal tenant"}
                    </div>
                    <Image
                      alt={item.label}
                      className="aspect-[16/10] w-full rounded-[20px] object-cover object-top"
                      height={720}
                      sizes="(max-width: 1024px) 100vw, 52vw"
                      src={item.image}
                      width={1280}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {isOhMyRewards ? (
        <section className="section-space pt-0">
          <div className="container-shell grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
            <div>
              <SectionHeading
                accent="warm"
                eyebrow={locale === "en" ? "Reward catalog" : "Catálogo de premios"}
                title={
                  locale === "en"
                    ? "Real rewards, controlled online and operated by Zegendia."
                    : "Premios reales, controlados en línea y operados por Zegendia."
                }
                description={
                  locale === "en"
                    ? "The core business is not only access to products. It is catalog control, delivery, risk management, claims, visibility, and a reward operation that can evolve without breaking the client program."
                    : "El core business no es solo tener acceso a productos. Es control de catálogo, entrega, manejo de riesgo, reclamos, visibilidad y una operación de premios que puede moverse sin romper el programa del cliente."
                }
              />

              <div className="mt-9 grid gap-5 sm:grid-cols-2">
                {omrOperationalPromise.map((item, index) => (
                  <div className="border-t border-white/10 pt-5" key={item.label}>
                    <div
                      className={cn(
                        "font-display text-4xl font-semibold",
                        index === 0 ? productConfig.accentText : index === 1 ? "text-[#9de1e3]" : index === 2 ? "text-[#b7e78c]" : "text-[#d4b7e7]"
                      )}
                    >
                      {item.value}
                    </div>
                    <h3 className="mt-3 font-display text-xl font-semibold text-white">{item.label}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[680px] overflow-hidden rounded-[36px] border border-white/10 bg-[#060b15] shadow-2xl shadow-black/25 lg:min-h-[760px]">
              <Image
                alt={locale === "en" ? "Regional rewards catalog warehouse" : "Catálogo regional de premios físicos"}
                className="object-cover object-center"
                fill
                sizes="(max-width: 1024px) 100vw, 56vw"
                src="/images/products/oh-my-rewards/premios.png"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,22,0.05)_0%,rgba(6,10,22,0.18)_48%,rgba(6,10,22,0.64)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#e44c44] via-[#2e636b] to-[#549c24]" />
            </div>
          </div>
        </section>
      ) : null}

      {isOhMyRewards ? (
        <section className="section-space pt-0">
          <div className="container-shell">
            <SectionHeading
              accent="warm"
              eyebrow={locale === "en" ? "SLA promise" : "Promesa SLA"}
              title={
                locale === "en"
                  ? "Operational commitments that make rewards work in real life."
                  : "Compromisos operativos para que los premios funcionen en la vida real."
              }
              description={
                locale === "en"
                  ? "Behind the catalog there is a service model: delivery windows, claim handling, proof of delivery, recipient follow-up, reporting, and escalation paths."
                  : "Detrás del catálogo hay un modelo de servicio: ventanas de entrega, manejo de reclamos, prueba de entrega, seguimiento al destinatario, reportes y rutas de escalamiento."
              }
            />

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {omrSlaMetrics.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055)_0%,rgba(255,255,255,0.025)_100%)] p-5"
                    key={item.label}
                  >
                    <div
                      className={cn(
                        "absolute inset-x-0 top-0 h-1",
                        index % 4 === 0
                          ? "bg-[#e44c44]"
                          : index % 4 === 1
                            ? "bg-[#2e636b]"
                            : index % 4 === 2
                              ? "bg-[#549c24]"
                              : "bg-[#3d284c]"
                      )}
                    />
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]",
                          index % 4 === 0
                            ? "text-[#ffb0aa]"
                            : index % 4 === 1
                              ? "text-[#9de1e3]"
                              : index % 4 === 2
                                ? "text-[#b7e78c]"
                                : "text-[#d4b7e7]"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-right font-display text-sm text-slate-600">0{index + 1}</div>
                    </div>
                    <div
                      className={cn(
                        "mt-6 font-display text-3xl font-semibold",
                        index % 4 === 0
                          ? productConfig.accentText
                          : index % 4 === 1
                            ? "text-[#9de1e3]"
                            : index % 4 === 2
                              ? "text-[#b7e78c]"
                              : "text-[#d4b7e7]"
                      )}
                    >
                      {item.value}
                    </div>
                    <h3 className="mt-3 font-display text-xl font-semibold leading-tight text-white">{item.label}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {isOhMyRewards ? (
        <section className="section-space pt-0">
          <div className="container-shell grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
            <div>
              <SectionHeading
                accent="warm"
                eyebrow={locale === "en" ? "Regional coverage" : "Cobertura regional"}
                title={locale === "en" ? "Regional rewards coverage across Latin America." : "Cobertura regional de premios en toda Latinoamérica."}
                description={
                  locale === "en"
                    ? "Oh My Rewards helps loyalty, banking, fintech, retail, and incentive programs deliver physical and digital rewards through one regional operating layer."
                    : "Oh My Rewards permite que programas de lealtad, banca, fintech, retail e incentivos entreguen premios físicos y digitales mediante una sola capa operativa regional."
                }
              />
              <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {locale === "en"
                  ? "The client keeps one integration and one commercial relationship; Zegendia coordinates catalog availability, providers, support, fulfillment, and reconciliation country by country."
                  : "El cliente mantiene una integración y una relación comercial; Zegendia coordina disponibilidad de catálogo, proveedores, soporte, fulfillment y conciliación país por país."}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_45%_55%,rgba(46,99,107,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.055)_0%,rgba(255,255,255,0.02)_100%)] p-5 sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
                <div className="relative mx-auto aspect-[3/4] w-full max-w-[250px]">
                  <Image
                    alt={locale === "en" ? "Latin America coverage map" : "Mapa de cobertura en Latinoamérica"}
                    className="object-contain drop-shadow-[0_0_28px_rgba(46,99,107,0.45)]"
                    fill
                    sizes="250px"
                    src="/images/sections/latam-map-clean.png"
                  />
                </div>

                <div>
                  <div className={cn("text-xs uppercase tracking-[0.22em]", productConfig.accentText)}>
                    {locale === "en" ? "Active regional footprint" : "Huella regional activa"}
                  </div>
                  <div className="mt-5 grid gap-x-5 gap-y-2 sm:grid-cols-2">
                    {omrCountries.map((country, index) => (
                      <div className="flex items-center gap-3 border-t border-white/10 py-2.5 text-sm text-slate-200" key={country}>
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            index % 4 === 0 ? "bg-[#e44c44]" : index % 4 === 1 ? "bg-[#2e636b]" : index % 4 === 2 ? "bg-[#549c24]" : "bg-[#3d284c]"
                          )}
                        />
                        {country}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
                {[
                  locale === "en" ? "One commercial relationship" : "Una relación comercial",
                  locale === "en" ? "One API and tenant portal" : "Una API y portal tenant",
                  locale === "en" ? "One consolidated operation" : "Una operación consolidada"
                ].map((item, index) => (
                  <div className="text-sm leading-7 text-slate-300" key={item}>
                    <span className={cn("mr-3 inline-block h-2 w-2 rounded-full", index === 0 ? "bg-[#e44c44]" : index === 1 ? "bg-[#2e636b]" : "bg-[#549c24]")} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {"pillars" in content && !isOhMyRewards ? (
        <section className="section-space pt-0">
          <div className="container-shell">
            <SectionHeading
              accent={productConfig.accent}
              eyebrow={locale === "en" ? "Operating logic" : "Lógica operativa"}
              title={productConfig.journeyTitle}
            />

            <div className="mt-10 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[34px] border border-white/10 bg-white/[0.03] p-6 sm:p-7">
                <div className="space-y-6">
                  {productConfig.journey.map((item, index) => (
                    <div className="flex gap-4" key={item}>
                      <div className={cn("mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white", productConfig.accentDot)}>
                        {index + 1}
                      </div>
                      <p className="text-sm leading-7 text-slate-300 sm:text-base">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                {(content.pillars as { title: string; text: string }[]).map((pillar, index) => (
                  <div className="border-t border-white/10 pt-5" key={pillar.title}>
                    <div className={cn("text-xs uppercase tracking-[0.22em]", index % 2 === 0 ? productConfig.accentText : "text-slate-400")}>
                      0{index + 1}
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-white">{pillar.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">{pillar.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {"features" in content && !isOhMyRewards ? (
        <section className="section-space pt-0">
          <div className="container-shell">
            <SectionHeading
              accent={productConfig.accent}
              eyebrow={locale === "en" ? "Capabilities" : "Capacidades"}
              title={
                locale === "en"
                  ? "Designed to execute the promise, not just present it."
                  : "Diseñado para cumplir la promesa, no solo para presentarla."
              }
            />

            <div className="mt-10 grid gap-x-8 gap-y-5 md:grid-cols-2">
              {(content.features as string[]).map((feature, index) => (
                <div className="flex items-start gap-4 border-t border-white/10 pt-5" key={feature}>
                  <span className={cn("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", index % 2 === 0 ? productConfig.accentDot : "bg-[#2e636b]")} />
                  <span className="text-sm leading-7 text-slate-300 sm:text-base">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {"categories" in content && !isOhMyRewards ? (
        <section className="section-space pt-0">
          <div className="container-shell grid gap-6 lg:grid-cols-2">
            <div className="rounded-[34px] border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <div className={cn("text-xs uppercase tracking-[0.22em]", productConfig.accentText)}>
                {locale === "en" ? "Reward categories" : "Categorías de premios"}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(content.categories as string[]).map((category) => (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200" key={category}>
                    {category}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[34px] border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <div className={cn("text-xs uppercase tracking-[0.22em]", productConfig.accentText)}>
                {locale === "en" ? "Regional coverage" : "Cobertura regional"}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(content.countries as string[]).map((country, index) => (
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200" key={country}>
                    <span className={cn("h-2.5 w-2.5 rounded-full", index % 3 === 0 ? productConfig.accentDot : index % 3 === 1 ? "bg-[#2e636b]" : "bg-[#3d284c]")} />
                    {country}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {"primitives" in content ? (
        <section className="section-space pt-0">
          <div className="container-shell">
            <SectionHeading
              accent={productConfig.accent}
              eyebrow={locale === "en" ? "The model behind PuntosPlus" : "El modelo detrás de PuntosPlus"}
              title={locale === "en" ? "Eight primitives explained in business language." : "Ocho primitivas explicadas en lenguaje de negocio."}
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {(content.primitives as { name: string; description: string }[]).map((primitive, index) => (
                <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6" key={primitive.name}>
                  <div className={cn("text-xs uppercase tracking-[0.22em]", index % 2 === 0 ? productConfig.accentText : "text-[#9de1e3]")}>
                    {primitive.name}
                  </div>
                  <p className="mt-4 text-sm leading-8 text-slate-300 sm:text-base">{primitive.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {"plans" in content ? (
        <section className="section-space pt-0">
          <div className="container-shell">
            <SectionHeading
              accent={productConfig.accent}
              eyebrow={locale === "en" ? "Plans" : "Planes"}
              title={locale === "en" ? "From accessible entry to scalable operation." : "Desde entrada accesible hasta operación escalable."}
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {(content.plans as { name: string; price: string; items: string[] }[]).map((plan, index) => (
                <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,15,28,0.8)_0%,rgba(7,12,24,0.94)_100%)] p-6" key={plan.name}>
                  <div className={cn("text-xs uppercase tracking-[0.22em]", index === 0 ? productConfig.accentText : index === 1 ? "text-[#9de1e3]" : index === 2 ? "text-[#ffb0aa]" : "text-[#d4b7e7]")}>
                    {plan.name}
                  </div>
                  <div className="mt-4 font-display text-3xl font-semibold text-white">{plan.price}</div>
                  <div className="mt-6 space-y-3">
                    {plan.items.map((item) => (
                      <div className="flex items-start gap-3" key={item}>
                        <span className={cn("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", index === 0 ? productConfig.accentDot : index === 1 ? "bg-[#2e636b]" : index === 2 ? "bg-[#e44c44]" : "bg-[#3d284c]")} />
                        <span className="text-sm leading-7 text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {"developerBlocks" in content && !isOhMyRewards ? (
        <section className="section-space pt-0">
          <div className="container-shell grid gap-6 lg:grid-cols-2">
            {(content.developerBlocks as { title: string; text: string }[]).map((block, index) => (
              <div className="rounded-[34px] border border-white/10 bg-white/[0.03] p-6 sm:p-7" key={block.title}>
                <div className={cn("text-xs uppercase tracking-[0.22em]", index === 0 ? productConfig.accentText : "text-[#9de1e3]")}>
                  {index === 0
                    ? locale === "en"
                      ? "Product + engineering"
                      : "Producto + ingeniería"
                    : locale === "en"
                      ? "Operations + finance"
                      : "Operaciones + finanzas"}
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-white">{block.title}</h3>
                <p className="mt-4 text-sm leading-8 text-slate-300 sm:text-base">{block.text}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <CTASection
        primary={cta.primary}
        primaryVariant={productKey === "ohMyRewards" ? "brandWarm" : "brandGreen"}
        secondary={cta.secondary}
        text={cta.text}
        title={cta.title}
      />
    </SiteShell>
  );
}
