import { BlogCard } from "@/components/sections/blog-card";
import { SiteShell } from "@/components/site-shell";
import { getLocalePrefix, getSiteContent } from "@/lib/content";
import { getAllBlogPosts } from "@/lib/blog";
import type { Locale } from "@/lib/types";

export async function BlogIndexPage({ locale }: { locale: Locale }) {
  const [site, posts] = await Promise.all([getSiteContent(locale), getAllBlogPosts(locale)]);
  const localePrefix = getLocalePrefix(locale);
  const featured = posts[0];
  const rest = posts.slice(1);
  const categories = Array.from(new Set(posts.map((post) => post.category))).slice(0, 6);
  const editorialSignals =
    locale === "en"
      ? ["Loyalty strategy", "Rewards operations", "LATAM execution", "AI applied to catalogs"]
      : ["Estrategia de loyalty", "Operación de rewards", "Ejecución LATAM", "AI aplicada a catálogos"];

  return (
    <SiteShell locale={locale} site={site}>
      <section className="section-space overflow-hidden pb-16">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-end">
          <div>
            <div className="section-kicker section-kicker--green">
              {locale === "en" ? "Loyalty intelligence" : "Inteligencia de loyalty"}
            </div>
            <h1 className="headline-balance max-w-5xl font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              {locale === "en"
                ? "Ideas for building loyalty programs that work in the real world."
                : "Ideas para construir programas de lealtad que funcionen en el mundo real."}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              {locale === "en"
                ? "A sharper editorial space about loyalty design, rewards fulfillment, gamification, AI, and what it actually takes to operate programs across Latin America."
                : "Un espacio editorial sobre diseño de loyalty, fulfillment de premios, gamificación, AI y lo que realmente implica operar programas en Latinoamérica."}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#071020]/80 p-6 shadow-[0_30px_90px_rgba(25,215,255,0.1)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(228,76,68,0.2),transparent_28%),radial-gradient(circle_at_72%_28%,rgba(46,99,107,0.26),transparent_30%),radial-gradient(circle_at_80%_82%,rgba(84,156,36,0.18),transparent_24%)]" />
            <div className="relative">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9de1e3]">
                {locale === "en" ? "Editorial radar" : "Radar editorial"}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {editorialSignals.map((signal, index) => (
                  <div
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 text-sm text-slate-200"
                    key={signal}
                  >
                    <span
                      className={
                        index % 4 === 0
                          ? "h-2 w-2 rounded-full bg-[#e44c44]"
                          : index % 4 === 1
                            ? "h-2 w-2 rounded-full bg-[#2e636b]"
                            : index % 4 === 2
                              ? "h-2 w-2 rounded-full bg-[#549c24]"
                              : "h-2 w-2 rounded-full bg-[#3d284c]"
                      }
                    />
                    {signal}
                  </div>
                ))}
              </div>
              <p className="mt-6 border-l border-[#e44c44]/70 pl-4 text-sm leading-7 text-slate-300">
                {locale === "en"
                  ? "The point is not to publish generic marketing. It is to explain the operational decisions that make loyalty measurable, credible, and scalable."
                  : "La idea no es publicar marketing genérico. Es explicar las decisiones operativas que hacen que la lealtad sea medible, creíble y escalable."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-shell">
          {categories.length ? (
            <div className="mb-8 flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300"
                  key={category}
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
                  {category}
                </span>
              ))}
            </div>
          ) : null}

          {featured ? (
            <div className="mb-6">
              <BlogCard locale={locale} localePrefix={localePrefix} post={featured} variant="featured" />
            </div>
          ) : (
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 text-slate-300">
              {locale === "en"
                ? "No published articles yet. New Zegendia insights will appear here."
                : "Aún no hay artículos publicados. Aquí aparecerán los nuevos insights de Zegendia."}
            </div>
          )}

          {rest.length ? (
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {rest.map((post) => (
                <BlogCard key={`${post.locale}-${post.slug}`} locale={locale} localePrefix={localePrefix} post={post} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </SiteShell>
  );
}
