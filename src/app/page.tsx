import { HomePage } from "@/components/pages/home-page";
import { getSiteContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <HomePage locale="es" />;
}

export async function generateMetadata() {
  const site = await getSiteContent("es");
  return buildMetadata({
    description: site.home.seo.description,
    locale: "es",
    path: "/",
    title: site.home.seo.title
  });
}
