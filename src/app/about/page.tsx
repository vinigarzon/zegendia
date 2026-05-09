import { AboutPage } from "@/components/pages/about-page";
import { getSiteContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <AboutPage locale="es" />;
}

export async function generateMetadata() {
  const site = await getSiteContent("es");
  return buildMetadata({
    description: site.about.seo.description,
    locale: "es",
    path: "/about",
    title: site.about.seo.title
  });
}
