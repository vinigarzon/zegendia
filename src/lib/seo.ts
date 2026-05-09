import type { Metadata } from "next";

import type { Locale } from "@/lib/types";
import { absoluteUrl } from "@/lib/utils";

export function buildMetadata({
  locale,
  title,
  description,
  path,
  image = "/images/og/og-default.svg"
}: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Zegendia",
      locale: locale === "es" ? "es_LA" : "en_US",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    }
  };
}
