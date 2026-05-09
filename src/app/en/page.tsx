import { HomePage } from "@/components/pages/home-page";
import { getSiteContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <HomePage locale="en" />;
}

export async function generateMetadata() {
  const site = await getSiteContent("en");
  return buildMetadata({
    description: site.home.seo.description,
    locale: "en",
    path: "/en",
    title: site.home.seo.title
  });
}
