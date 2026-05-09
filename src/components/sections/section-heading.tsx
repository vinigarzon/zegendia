import { getSectionKickerAccentClass, type AccentTone } from "@/lib/theme";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  inverted?: boolean;
  accent?: AccentTone;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  inverted = true,
  accent = "cyan"
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl";
  const kickerAlignment = align === "center" ? "mx-auto" : "";
  const textColor = inverted ? "text-white" : "text-slate-950";
  const bodyColor = inverted ? "text-slate-300" : "text-slate-600";

  return (
    <div className={alignment}>
      {eyebrow ? (
        <div className={cn("section-kicker", kickerAlignment, getSectionKickerAccentClass(accent))}>{eyebrow}</div>
      ) : null}
      <h2 className={`headline-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl ${textColor}`}>
        {title}
      </h2>
      {description ? (
        <p className={`mt-5 text-base leading-8 sm:text-lg ${bodyColor}`}>{description}</p>
      ) : null}
    </div>
  );
}
