import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductCardContent } from "@/lib/types";
import { isExternalHref } from "@/lib/utils";

const productLogos: Record<string, { src: string }> = {
  "Zegendia Core": { src: "/images/brand/zegendia-logo.png" },
  "Oh My Rewards": { src: "/images/brand/oh-2.svg" },
  PuntosPlus: { src: "/images/brand/puntosplus-logo-white.png" }
};

export function ProductCard({ card, locale }: { card: ProductCardContent; locale: "es" | "en" }) {
  const isExternal = isExternalHref(card.href);
  const label = isExternal
    ? locale === "en"
      ? "Open platform"
      : "Abrir plataforma"
    : locale === "en"
      ? "Explore"
      : "Explorar";
  const logo = productLogos[card.name];

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-between gap-8">
        <div>
          {card.eyebrow ? <Badge className="mb-4">{card.eyebrow}</Badge> : null}
          {logo ? (
            <div
              className={`relative mb-5 h-12 ${
                card.name === "PuntosPlus" ? "w-[250px]" : card.name === "Zegendia Core" ? "w-[230px]" : "w-[180px]"
              }`}
            >
              <Image alt={card.name} className="object-contain object-left" fill sizes="220px" src={logo.src} />
            </div>
          ) : null}
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">{card.name}</div>
          <h3 className="mt-3 font-display text-2xl font-semibold text-white">{card.title}</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">{card.description}</p>
        </div>
        {isExternal ? (
          <a
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#78d5d7]"
            href={card.href}
            rel="noreferrer"
            target="_blank"
          >
            {label}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        ) : (
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#78d5d7]" href={card.href as Route}>
            {label}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
