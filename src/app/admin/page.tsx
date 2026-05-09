import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLayout } from "@/components/admin-layout";
import { getAdminSession } from "@/lib/auth";
import { getSiteContent } from "@/lib/content";

export default async function Page() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const site = await getSiteContent("es");

  return (
    <AdminLayout
      subtitle="Centro editorial local para crear, editar, publicar, optimizar SEO, administrar imágenes del blog y revisar leads enviados desde el sitio."
      title={site.admin.dashboardTitle}
    >
      <AdminDashboard />
    </AdminLayout>
  );
}
