import { ChatbotWidget } from "@/components/sections/chatbot-widget";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale, SiteContent } from "@/lib/types";

type SiteShellProps = {
  locale: Locale;
  site: SiteContent;
  children: React.ReactNode;
};

export function SiteShell({ locale, site, children }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-transparent">
      <SiteHeader
        languageLabel={site.common.languageToggle}
        locale={locale}
        nav={site.nav}
      />
      <main>{children}</main>
      <SiteFooter content={site.footer} locale={locale} />
      <ChatbotWidget locale={locale} />
    </div>
  );
}
