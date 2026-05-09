import type { AdminBlogRecord, Locale } from "@/lib/types";
import { getSeedBlogPostBySlug, getSeedBlogPosts, mergePublishedPosts } from "@/lib/content";
import { listAdminPosts } from "@/lib/storage";

export async function getAllBlogPosts(locale: Locale) {
  const [seed, admin] = await Promise.all([getSeedBlogPosts(locale), listAdminPosts()]);

  const localizedAdmin = admin.filter((post) => post.locale === locale) as AdminBlogRecord[];
  return mergePublishedPosts(seed as AdminBlogRecord[], localizedAdmin);
}

export async function getBlogPostBySlug(locale: Locale, slug: string) {
  const seed = await getSeedBlogPostBySlug(locale, slug);
  const admin = await listAdminPosts();
  const adminPost = admin.find((post) => post.locale === locale && post.slug === slug);

  const candidate = adminPost ?? seed;
  if (!candidate || (candidate.status ?? "published") !== "published") {
    return null;
  }

  return candidate;
}
