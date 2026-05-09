import { ContactPage } from "@/components/pages/contact-page";
import { getSiteContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <ContactPage locale="en" />;
}

export async function generateMetadata() {
  const site = await getSiteContent("en");
  return buildMetadata({
    description: site.contact.seo.description,
    locale: "en",
    path: "/en/contact",
    title: site.contact.seo.title
  });
}
