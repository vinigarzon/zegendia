import { ContactPage } from "@/components/pages/contact-page";
import { getSiteContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <ContactPage locale="es" />;
}

export async function generateMetadata() {
  const site = await getSiteContent("es");
  return buildMetadata({
    description: site.contact.seo.description,
    locale: "es",
    path: "/contact",
    title: site.contact.seo.title
  });
}
