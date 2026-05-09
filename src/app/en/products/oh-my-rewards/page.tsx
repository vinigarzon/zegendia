import { ProductDetailPage } from "@/components/pages/product-detail-page";
import { getProductsContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <ProductDetailPage locale="en" productKey="ohMyRewards" />;
}

export async function generateMetadata() {
  const products = await getProductsContent("en");
  const seo = products.ohMyRewards.seo as { title: string; description: string };

  return buildMetadata({
    description: seo.description,
    locale: "en",
    path: "/en/products/oh-my-rewards",
    title: seo.title
  });
}
