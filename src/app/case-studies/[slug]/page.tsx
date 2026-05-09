import { CaseStudyPage } from "@/components/pages/case-study-page";
import { getSeedCaseStudies, getSeedCaseStudyBySlug } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CaseStudyPage locale="es" slug={slug} />;
}

export async function generateStaticParams() {
  const studies = await getSeedCaseStudies("es");
  return studies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getSeedCaseStudyBySlug("es", slug);

  return buildMetadata({
    description: study?.excerpt || "Caso de éxito Zegendia",
    locale: "es",
    path: `/case-studies/${slug}`,
    title: study?.title || "Caso de éxito | Zegendia"
  });
}
