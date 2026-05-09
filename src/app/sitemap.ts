import type { MetadataRoute } from "next";

import { getSeedCaseStudies } from "@/lib/content";
import { getAllBlogPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postsEs, postsEn, casesEs, casesEn] = await Promise.all([
    getAllBlogPosts("es"),
    getAllBlogPosts("en"),
    getSeedCaseStudies("es"),
    getSeedCaseStudies("en")
  ]);

  const staticRoutes = [
    "/",
    "/about",
    "/products",
    "/products/oh-my-rewards",
    "/products/puntosplus",
    "/case-studies",
    "/blog",
    "/contact",
    "/en",
    "/en/about",
    "/en/products",
    "/en/products/oh-my-rewards",
    "/en/products/puntosplus",
    "/en/case-studies",
    "/en/blog",
    "/en/contact"
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route),
      changeFrequency: "weekly" as const,
      priority: route === "/" || route === "/en" ? 1 : 0.8
    })),
    ...postsEs.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.date,
      changeFrequency: "monthly" as const,
      priority: 0.7
    })),
    ...postsEn.map((post) => ({
      url: absoluteUrl(`/en/blog/${post.slug}`),
      lastModified: post.date,
      changeFrequency: "monthly" as const,
      priority: 0.7
    })),
    ...casesEs.map((study) => ({
      url: absoluteUrl(`/case-studies/${study.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.75
    })),
    ...casesEn.map((study) => ({
      url: absoluteUrl(`/en/case-studies/${study.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.75
    }))
  ];
}
