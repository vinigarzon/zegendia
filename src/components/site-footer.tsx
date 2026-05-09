import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import type { SiteContent } from "@/lib/types";
import { isExternalHref } from "@/lib/utils";

type SiteFooterProps = {
  locale: "es" | "en";
  content: SiteContent["footer"];
};

function InstagramIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <rect height="17.5" rx="5" stroke="currentColor" strokeWidth="1.8" width="17.5" x="3.25" y="3.25" />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.7" fill="currentColor" r="1.15" />
    </svg>
  );
}

export function SiteFooter({ content, locale }: SiteFooterProps) {
  const offices = content.contactCards.slice(0, 3);
  const regionalCoverage = content.contactCards[3];
  const homeHref = locale === "en" ? "/en" : "/";
  const countries =
    locale === "en"
      ? [
          "Mexico",
          "Guatemala",
          "Honduras",
          "El Salvador",
          "Nicaragua",
          "Costa Rica",
          "Panama",
          "Dominican Republic",
          "Colombia",
          "Venezuela",
          "Ecuador",
          "Peru",
          "Bolivia",
          "Brazil",
          "Paraguay",
          "Chile",
          "Argentina",
          "Uruguay"
        ]
      : [
          "México",
          "Guatemala",
          "Honduras",
          "El Salvador",
          "Nicaragua",
          "Costa Rica",
          "Panamá",
          "República Dominicana",
          "Colombia",
          "Venezuela",
          "Ecuador",
          "Perú",
          "Bolivia",
          "Brasil",
          "Paraguay",
          "Chile",
          "Argentina",
          "Uruguay"
        ];
  const products = [
    {
      href: homeHref,
      icon: "/images/brand/footer-zegendia-icon.png",
      label: "Zegendia"
    },
    {
      href: "https://app.ohmyrewards.com",
      icon: "/images/brand/footer-oh-icon.png",
      label: "Oh My Rewards"
    },
    {
      href: "https://puntosplus.com",
      icon: "/images/brand/footer-puntosplus-icon.png",
      label: "PuntosPlus"
    }
  ];

  return (
    <footer className="border-t border-white/8 bg-[#030712] bg-[radial-gradient(circle_at_18%_0%,rgba(228,76,68,0.1),transparent_28%),radial-gradient(circle_at_86%_10%,rgba(46,99,107,0.16),transparent_28%)]">
      <div className="container-shell py-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.95fr_1fr]">
          <div>
            <Link className="relative block h-12 w-[160px]" href={homeHref as Route}>
              <Image alt="Zegendia" className="object-contain object-left" fill src="/images/brand/zegendia-logo.png" />
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">{content.description}</p>

            <div className="mt-6 flex items-center gap-4">
              {products.map((product) => {
                const external = isExternalHref(product.href);
                const className = "relative block h-9 w-9 opacity-85 transition hover:scale-105 hover:opacity-100";
                const icon = (
                  <Image alt={product.label} className="object-contain" fill sizes="36px" src={product.icon} />
                );

                return external ? (
                  <a aria-label={product.label} className={className} href={product.href} key={product.label} rel="noreferrer" target="_blank">
                    {icon}
                  </a>
                ) : (
                  <Link aria-label={product.label} className={className} href={product.href as Route} key={product.label}>
                    {icon}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {content.columns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                  {column.title}
                </h3>
                <div className="space-y-3">
                  {column.links.map((link) => (
                    isExternalHref(link.href) ? (
                      <a
                        className="block text-sm text-slate-400 hover:text-white"
                        href={link.href}
                        key={link.href}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link className="block text-sm text-slate-400 hover:text-white" href={link.href as Route} key={link.href}>
                        {link.label}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
              {locale === "en" ? "Regional operation" : "Operación regional"}
            </h3>
            {regionalCoverage ? (
              <div>
                <div className="text-sm font-semibold text-white">{regionalCoverage.market}</div>
                <p className="mt-3 text-sm leading-7 text-slate-400">{regionalCoverage.detail[0]}</p>
                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
                  {countries.map((country) => (
                    <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500" key={country}>
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10 grid gap-6 border-t border-white/8 pt-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              {locale === "en" ? "Offices" : "Oficinas"}
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {offices.map((card) => (
                <div className="min-w-[190px]" key={card.market}>
                  <div className="font-semibold text-white">{card.market}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-500">
                    {card.detail.slice(-2).map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm text-slate-500 lg:items-end">
            <a
              className="inline-flex items-center gap-2 text-slate-500 hover:text-[#ffb0aa]"
              href="https://www.instagram.com/zegendia/"
              rel="noreferrer"
              target="_blank"
            >
              <InstagramIcon />
              <span>@zegendia</span>
            </a>
            <div>{content.legal}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
