import { ProductDetailPage } from "@/components/pages/product-detail-page";
import { getProductsContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <ProductDetailPage locale="es" productKey="puntosPlus" />;
}

export async function generateMetadata() {
  const products = await getProductsContent("es");
  const seo = products.puntosPlus.seo as { title: string; description: string };

  return buildMetadata({
    description: seo.description,
    locale: "es",
    path: "/products/puntosplus",
    title: seo.title
  });
}
