import { BlogIndexPage } from "@/components/pages/blog-index-page";
import { getSiteContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <BlogIndexPage locale="es" />;
}

export async function generateMetadata() {
  const site = await getSiteContent("es");
  return buildMetadata({
    description: site.meta.defaultDescription,
    locale: "es",
    path: "/blog",
    title: "Blog | Zegendia"
  });
}
