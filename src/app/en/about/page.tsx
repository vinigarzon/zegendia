import { AboutPage } from "@/components/pages/about-page";
import { getSiteContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <AboutPage locale="en" />;
}

export async function generateMetadata() {
  const site = await getSiteContent("en");
  return buildMetadata({
    description: site.about.seo.description,
    locale: "en",
    path: "/en/about",
    title: site.about.seo.title
  });
}
