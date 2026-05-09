import { CaseStudyPage } from "@/components/pages/case-study-page";
import { getSeedCaseStudies, getSeedCaseStudyBySlug } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CaseStudyPage locale="en" slug={slug} />;
}

export async function generateStaticParams() {
  const studies = await getSeedCaseStudies("en");
  return studies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getSeedCaseStudyBySlug("en", slug);

  return buildMetadata({
    description: study?.excerpt || "Zegendia case study",
    locale: "en",
    path: `/en/case-studies/${slug}`,
    title: study?.title || "Case study | Zegendia"
  });
}
