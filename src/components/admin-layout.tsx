"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type AdminLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AdminLayout({ title, subtitle, children }: AdminLayoutProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#040816] bg-[radial-gradient(circle_at_12%_8%,rgba(228,76,68,0.16),transparent_24%),radial-gradient(circle_at_78%_12%,rgba(46,99,107,0.2),transparent_24%),radial-gradient(circle_at_82%_78%,rgba(84,156,36,0.12),transparent_22%)]">
      <div className="mx-auto w-full max-w-[1800px] px-4 py-8 sm:px-6 2xl:px-8">
        <div className="mb-8 overflow-hidden rounded-[30px] border border-white/10 bg-[#071020]/78 shadow-[0_30px_90px_rgba(25,215,255,0.1)]">
          <div className="h-px bg-[linear-gradient(90deg,#e44c44,#2e636b,#549c24,#3d284c)]" />
          <div className="flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker section-kicker--cyan mb-3">Zegendia admin</div>
              <h1 className="headline-balance font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">{subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                href="/blog"
                target="_blank"
              >
                Ver blog
              </a>
              <Button onClick={handleLogout} variant="brandWarm">
                Logout
              </Button>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
