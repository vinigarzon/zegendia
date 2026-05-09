import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StructuredData } from "@/components/structured-data";
import { SiteShell } from "@/components/site-shell";
import { getSiteContent } from "@/lib/content";
import { Markdown } from "@/lib/markdown";
import { getBlogPostBySlug } from "@/lib/blog";
import type { Locale } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export async function BlogPostPage({
  locale,
  slug
}: {
  locale: Locale;
  slug: string;
}) {
  const [site, post] = await Promise.all([getSiteContent(locale), getBlogPostBySlug(locale, slug)]);
  if (!post) {
    notFound();
  }
  const backHref = locale === "en" ? "/en/blog" : "/blog";
  const contactHref = locale === "en" ? "/en/contact" : "/contact";
  const wordCount = post.body.trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(3, Math.ceil(wordCount / 220));

  return (
    <SiteShell locale={locale} site={site}>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.coverImage,
          datePublished: post.date,
          inLanguage: locale,
          author: {
            "@type": "Organization",
            name: "Zegendia"
          }
        }}
      />
      <section className="section-space overflow-hidden pb-14">
        <div className="container-shell">
          <Link
            className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-[#78d5d7]/40 hover:text-white"
            href={backHref}
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#e44c44]" />
            {locale === "en" ? "Back to blog" : "Volver al blog"}
          </Link>

          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <div className="section-kicker section-kicker--warm">
                {locale === "en" ? "Zegendia insight" : "Insight Zegendia"}
              </div>
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="rounded-full border border-[#549c24]/25 bg-[#549c24]/10 px-3 py-1 font-medium text-[#b7e78c]">
                  {post.category}
                </span>
                <span>{formatDate(post.date, locale)}</span>
                <span className="h-1 w-1 rounded-full bg-[#2e636b]" />
                <span>{locale === "en" ? `${readingMinutes} min read` : `${readingMinutes} min de lectura`}</span>
              </div>
              <h1 className="headline-balance font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                {post.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">{post.excerpt}</p>
              {post.tags?.length ? (
                <div className="mt-7 flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300"
                      key={tag}
                    >
                      <span
                        className={
                          index % 3 === 0
                            ? "h-1.5 w-1.5 rounded-full bg-[#e44c44]"
                            : index % 3 === 1
                              ? "h-1.5 w-1.5 rounded-full bg-[#2e636b]"
                              : "h-1.5 w-1.5 rounded-full bg-[#549c24]"
                        }
                      />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {post.coverImage ? (
              <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#08101f] p-3 shadow-[0_30px_90px_rgba(25,215,255,0.12)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(228,76,68,0.24),transparent_30%),radial-gradient(circle_at_84%_72%,rgba(84,156,36,0.16),transparent_24%)]" />
                <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-white/10">
                  <Image
                    alt={post.title}
                    className="object-cover object-center"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 54vw"
                    src={post.coverImage}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(4,8,22,0.54)_100%)]" />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,#e44c44,#2e636b,#549c24,#3d284c)]" />
              <div className="text-xs uppercase tracking-[0.22em] text-[#9de1e3]">
                {locale === "en" ? "Article profile" : "Ficha del artículo"}
              </div>
              <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-300">
                <div className="border-b border-white/8 pb-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {locale === "en" ? "Category" : "Categoría"}
                  </div>
                  <div className="mt-1 text-white">{post.category}</div>
                </div>
                <div className="border-b border-white/8 pb-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {locale === "en" ? "Published" : "Publicado"}
                  </div>
                  <div className="mt-1 text-white">{formatDate(post.date, locale)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {locale === "en" ? "Reading time" : "Tiempo de lectura"}
                  </div>
                  <div className="mt-1 text-white">
                    {locale === "en" ? `${readingMinutes} minutes` : `${readingMinutes} minutos`}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[#071020]/80 p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-[#b7e78c]">
                {locale === "en" ? "Why it matters" : "Por qué importa"}
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {locale === "en"
                  ? "Zegendia writes about loyalty from the operating side: behavior, rewards, fulfillment, measurement, and regional execution."
                  : "Zegendia escribe sobre loyalty desde la operación real: conducta, premios, fulfillment, medición y ejecución regional."}
              </p>
            </div>

            <Link
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#78d5d7]/25 bg-[#2e636b]/18 px-4 py-3 text-sm font-semibold text-[#a7eef0] transition hover:border-[#78d5d7]/45 hover:bg-[#2e636b]/28"
              href={contactHref}
            >
              {locale === "en" ? "Talk to Zegendia" : "Hablar con Zegendia"}
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#549c24]" />
            </Link>
          </aside>

          <div className="min-w-0 space-y-6">
            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.045] p-6 sm:p-8 lg:p-10">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,#e44c44,#2e636b,#549c24,#3d284c)]" />
              <Markdown source={post.body} />
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
