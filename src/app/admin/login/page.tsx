import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminSession } from "@/lib/auth";
import { getSiteContent } from "@/lib/content";

export default async function Page() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  const site = await getSiteContent("es");

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 p-8">
        <div className="text-xs uppercase tracking-[0.22em] text-cyan-200">Admin</div>
        <h1 className="mt-3 font-display text-4xl font-semibold text-white">{site.admin.loginTitle}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">{site.admin.loginDescription}</p>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
