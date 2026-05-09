import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";

import type { BlogFrontmatter } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function BlogCard({
  post,
  localePrefix,
  locale,
  variant = "default"
}: {
  post: BlogFrontmatter;
  localePrefix: string;
  locale: "es" | "en";
  variant?: "default" | "featured";
}) {
  const href = `${localePrefix}/blog/${post.slug}` as Route;
  const isFeatured = variant === "featured";

  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-[28px] border border-white/10 bg-[#08101f]/78 shadow-[0_28px_80px_rgba(25,215,255,0.1)] transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-[#0b1426]/92",
        isFeatured ? "lg:grid lg:grid-cols-[1.05fr_0.95fr]" : "flex flex-col"
      )}
    >
      <div className="absolute inset-x-0 top-0 z-10 h-px bg-[linear-gradient(90deg,#e44c44_0%,#2e636b_34%,#549c24_68%,#3d284c_100%)]" />
      <Link
        aria-label={locale === "en" ? `Read ${post.title}` : `Leer ${post.title}`}
        className={cn(
          "relative block overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(228,76,68,0.26),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(84,156,36,0.22),transparent_24%),linear-gradient(135deg,#12213c_0%,#0a1326_100%)]",
          isFeatured ? "min-h-[330px] lg:min-h-full" : "aspect-[16/10]"
        )}
        href={href}
      >
        {post.coverImage ? (
          <>
            <Image
              alt={post.title}
              className="object-cover transition duration-700 group-hover:scale-[1.035]"
              fill
              sizes={isFeatured ? "(max-width: 1024px) 100vw, 52vw" : "(max-width: 1024px) 100vw, 33vw"}
              src={post.coverImage}
            />
          </>
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,31,0.05)_0%,rgba(7,16,31,0.7)_100%),radial-gradient(circle_at_15%_18%,rgba(228,76,68,0.2),transparent_28%),radial-gradient(circle_at_84%_72%,rgba(84,156,36,0.17),transparent_24%)]" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            {post.category}
          </span>
          <span className="h-2 w-2 rounded-full bg-[#e44c44] shadow-[0_0_18px_rgba(228,76,68,0.75)]" />
        </div>
      </Link>

      <div className={cn("flex flex-1 flex-col", isFeatured ? "gap-7 p-7 sm:p-9" : "gap-5 p-6")}>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="uppercase tracking-[0.2em] text-[#9de1e3]">{post.category}</span>
          <span className="h-1 w-1 rounded-full bg-[#549c24]" />
          <span>{formatDate(post.date, locale)}</span>
        </div>

        <div className="space-y-3">
          <h3
            className={cn(
              "headline-balance font-display font-semibold tracking-tight text-white",
              isFeatured ? "text-3xl sm:text-4xl" : "text-2xl"
            )}
          >
            {post.title}
          </h3>
          <p className="text-sm leading-7 text-slate-300">{post.excerpt}</p>
        </div>

        {post.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, isFeatured ? 4 : 3).map((tag, index) => (
              <span
                className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.035] px-3 py-1 text-xs text-slate-300"
                key={tag}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    index % 3 === 0 && "bg-[#e44c44]",
                    index % 3 === 1 && "bg-[#2e636b]",
                    index % 3 === 2 && "bg-[#549c24]"
                  )}
                />
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <Link
          className="mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-[#78d5d7]/25 bg-[#2e636b]/18 px-4 py-2 text-sm font-semibold text-[#a7eef0] transition hover:border-[#78d5d7]/45 hover:bg-[#2e636b]/28"
          href={href}
        >
          {locale === "en" ? "Read article" : "Leer artículo"}
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#549c24]" />
        </Link>
      </div>
    </article>
  );
}
