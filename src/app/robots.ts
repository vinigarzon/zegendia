import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      userAgent: "*"
    },
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
