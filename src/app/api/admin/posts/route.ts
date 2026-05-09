import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { getSeedBlogPosts } from "@/lib/content";
import { deleteAdminPost, listAdminPosts, upsertAdminPost } from "@/lib/storage";
import type { AdminBlogRecord } from "@/lib/types";
import { adminPostSchema } from "@/lib/validators";

async function listEditablePosts() {
  const [adminPosts, esSeed, enSeed] = await Promise.all([
    listAdminPosts(),
    getSeedBlogPosts("es"),
    getSeedBlogPosts("en")
  ]);

  const adminMap = new Map(adminPosts.map((post) => [`${post.locale}:${post.slug}`, post]));
  const seedPosts = [...esSeed, ...enSeed].map((post) => {
    const key = `${post.locale}:${post.slug}`;
    const override = adminMap.get(key);
    if (override) {
      return override;
    }

    return {
      ...post,
      updatedAt: post.date,
      source: "seed" as const
    } satisfies AdminBlogRecord;
  });

  const seedKeys = new Set(seedPosts.map((post) => `${post.locale}:${post.slug}`));
  const adminOnlyPosts = adminPosts.filter((post) => !seedKeys.has(`${post.locale}:${post.slug}`));

  return [...adminOnlyPosts, ...seedPosts].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.date || 0).getTime();
    const dateB = new Date(b.updatedAt || b.date || 0).getTime();
    return dateB - dateA;
  });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const posts = await listEditablePosts();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = adminPostSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid post payload." }, { status: 400 });
  }

  const record = {
    ...parsed.data,
    updatedAt: new Date().toISOString(),
    source: "admin" as const
  };

  await upsertAdminPost(record);
  return NextResponse.json(record);
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as {
    locale?: AdminBlogRecord["locale"];
    slug?: string;
  } | null;

  if (!payload?.slug || !payload.locale || !["es", "en"].includes(payload.locale)) {
    return NextResponse.json({ message: "Invalid delete payload." }, { status: 400 });
  }

  const [adminPosts, seedPosts] = await Promise.all([
    listAdminPosts(),
    getSeedBlogPosts(payload.locale)
  ]);

  const seedPost = seedPosts.find((post) => post.slug === payload.slug);
  const adminPost = adminPosts.find((post) => post.locale === payload.locale && post.slug === payload.slug);

  if (seedPost) {
    const hiddenPost = {
      ...(adminPost ?? seedPost),
      locale: payload.locale,
      slug: payload.slug,
      status: "draft" as const,
      updatedAt: new Date().toISOString(),
      source: "admin" as const
    } satisfies AdminBlogRecord;

    await upsertAdminPost(hiddenPost);
    return NextResponse.json({ mode: "hidden", post: hiddenPost });
  }

  await deleteAdminPost(payload.locale, payload.slug);
  return NextResponse.json({ mode: "deleted", locale: payload.locale, slug: payload.slug });
}
