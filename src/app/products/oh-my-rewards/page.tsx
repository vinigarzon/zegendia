import { ProductDetailPage } from "@/components/pages/product-detail-page";
import { getProductsContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <ProductDetailPage locale="es" productKey="ohMyRewards" />;
}

export async function generateMetadata() {
  const products = await getProductsContent("es");
  const seo = products.ohMyRewards.seo as { title: string; description: string };

  return buildMetadata({
    description: seo.description,
    locale: "es",
    path: "/products/oh-my-rewards",
    title: seo.title
  });
}
