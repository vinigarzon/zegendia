import { CaseStudiesIndexPage } from "@/components/pages/case-studies-index-page";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <CaseStudiesIndexPage locale="en" />;
}

export async function generateMetadata() {
  return buildMetadata({
    description:
      "Explore real loyalty, rewards, fulfillment, and engagement case studies built by Zegendia across Latin America.",
    locale: "en",
    path: "/en/case-studies",
    title: "Case Studies & Portfolio | Zegendia"
  });
}
