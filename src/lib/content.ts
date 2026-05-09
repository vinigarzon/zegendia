import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

import { legacyCaseStudies } from "@/content/case-studies/legacy";
import type {
  AdminBlogRecord,
  BlogFrontmatter,
  CaseStudyFrontmatter,
  Locale,
  SiteContent
} from "@/lib/types";

const root = process.cwd();

async function readJsonFile<T>(relativePath: string) {
  const file = await readFile(path.join(root, relativePath), "utf8");
  return JSON.parse(file) as T;
}

export function getLocalePrefix(locale: Locale) {
  return locale === "en" ? "/en" : "";
}

export async function getSiteContent(locale: Locale) {
  return readJsonFile<SiteContent>(`src/content/site/${locale}.json`);
}

export async function getProductsContent(locale: Locale) {
  return readJsonFile<Record<string, any>>(`src/content/products/${locale}.json`);
}

async function readMdxDirectory<TFrontmatter>(
  relativeDir: string
): Promise<{ frontmatter: TFrontmatter; content: string }[]> {
  const absoluteDir = path.join(root, relativeDir);
  const files = await readdir(absoluteDir);
  const mdxFiles = files.filter((file) => file.endsWith(".mdx"));

  const entries = await Promise.all(
    mdxFiles.map(async (file) => {
      const source = await readFile(path.join(absoluteDir, file), "utf8");
      const parsed = matter(source);

      return {
        frontmatter: parsed.data as TFrontmatter,
        content: parsed.content
      };
    })
  );

  return entries;
}

export async function getSeedBlogPosts(locale: Locale) {
  const posts = await readMdxDirectory<BlogFrontmatter>(`src/content/blog/${locale}`);
  return posts.map((post) => ({
    ...post.frontmatter,
    body: post.content,
    source: "seed" as const
  }));
}

export async function getSeedCaseStudies(locale: Locale) {
  const cases = await readMdxDirectory<CaseStudyFrontmatter>(`src/content/case-studies/${locale}`);
  const mdxCases = cases.map((entry) => ({
    ...entry.frontmatter,
    body: entry.content
  }));

  const importedCases = legacyCaseStudies.map((study) => ({
    ...study[locale],
    locale,
    slug: study.slug
  }));

  return [...mdxCases, ...importedCases];
}

export async function getSeedBlogPostBySlug(locale: Locale, slug: string) {
  const posts = await getSeedBlogPosts(locale);
  return posts.find((post) => post.slug === slug);
}

export async function getSeedCaseStudyBySlug(locale: Locale, slug: string) {
  const studies = await getSeedCaseStudies(locale);
  return studies.find((study) => study.slug === slug);
}

export function sortByDateDesc<T extends { date?: string; createdAt?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date ?? a.createdAt ?? 0).getTime();
    const dateB = new Date(b.date ?? b.createdAt ?? 0).getTime();
    return dateB - dateA;
  });
}

export function mergePublishedPosts(seedPosts: AdminBlogRecord[], adminPosts: AdminBlogRecord[]) {
  const adminMap = new Map(adminPosts.map((post) => [post.slug, post]));

  const merged = seedPosts
    .map((post) => adminMap.get(post.slug) ?? post)
    .concat(adminPosts.filter((post) => !seedPosts.some((seed) => seed.slug === post.slug)));

  return sortByDateDesc(
    merged.filter((post) => (post.status ?? "published") === "published")
  );
}
