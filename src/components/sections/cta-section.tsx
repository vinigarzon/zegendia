import { LinkButton } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";

type CTASectionProps = {
  title: string;
  text: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  primaryVariant?: ButtonProps["variant"];
  secondaryVariant?: ButtonProps["variant"];
};

export function CTASection({
  title,
  text,
  primary,
  secondary,
  primaryVariant = "default",
  secondaryVariant = "secondary"
}: CTASectionProps) {
  return (
    <section className="section-space">
      <div className="container-shell">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(50,214,255,0.22),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(221,90,255,0.18),transparent_30%),linear-gradient(135deg,#091424_0%,#0d1730_44%,#071021_100%)] px-8 py-10 shadow-glow sm:px-10 sm:py-12">
          <div className="max-w-4xl">
            <h2 className="headline-balance font-display text-4xl font-semibold text-white sm:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">{text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href={primary.href} size="lg" variant={primaryVariant}>
                {primary.label}
              </LinkButton>
              <LinkButton href={secondary.href} size="lg" variant={secondaryVariant}>
                {secondary.label}
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
