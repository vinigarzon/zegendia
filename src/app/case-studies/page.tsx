import { CaseStudiesIndexPage } from "@/components/pages/case-studies-index-page";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <CaseStudiesIndexPage locale="es" />;
}

export async function generateMetadata() {
  return buildMetadata({
    description:
      "Conoce los casos reales de loyalty, rewards, fulfillment y engagement que Zegendia ha construido para marcas en Latinoamérica.",
    locale: "es",
    path: "/case-studies",
    title: "Casos de Éxito y Portfolio | Zegendia"
  });
}
