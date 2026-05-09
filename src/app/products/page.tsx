import { ProductsPage } from "@/components/pages/products-page";
import { getProductsContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export default function Page() {
  return <ProductsPage locale="es" />;
}

export async function generateMetadata() {
  const products = await getProductsContent("es");
  const seo = products.overview.seo as { title: string; description: string };

  return buildMetadata({
    description: seo.description,
    locale: "es",
    path: "/products",
    title: seo.title
  });
}
