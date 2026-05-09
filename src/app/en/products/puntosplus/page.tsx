import { ProductDetailPage } from "@/components/pages/product-detail-page";
import { getProductsContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <ProductDetailPage locale="en" productKey="puntosPlus" />;
}

export async function generateMetadata() {
  const products = await getProductsContent("en");
  const seo = products.puntosPlus.seo as { title: string; description: string };

  return buildMetadata({
    description: seo.description,
    locale: "en",
    path: "/en/products/puntosplus",
    title: seo.title
  });
}
