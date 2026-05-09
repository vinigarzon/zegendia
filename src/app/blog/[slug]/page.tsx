import { BlogPostPage } from "@/components/pages/blog-post-page";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog";
import { buildMetadata } from "@/lib/seo";

export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostPage locale="es" slug={slug} />;
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts("es");
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug("es", slug);

  return buildMetadata({
    description: post?.seoDescription || post?.excerpt || "Blog Zegendia",
    locale: "es",
    path: `/blog/${slug}`,
    title: post?.seoTitle || post?.title || "Blog Zegendia"
  });
}
