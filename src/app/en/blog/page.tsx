import { BlogIndexPage } from "@/components/pages/blog-index-page";
import { getSiteContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <BlogIndexPage locale="en" />;
}

export async function generateMetadata() {
  const site = await getSiteContent("en");
  return buildMetadata({
    description: site.meta.defaultDescription,
    locale: "en",
    path: "/en/blog",
    title: "Blog | Zegendia"
  });
}
