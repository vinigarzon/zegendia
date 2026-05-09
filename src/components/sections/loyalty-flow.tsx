import { getSectionKickerAccentClass, type AccentTone } from "@/lib/theme";
import { cn } from "@/lib/utils";

type LoyaltyFlowProps = {
  eyebrow: string;
  title: string;
  steps: string[];
  accent?: AccentTone;
};

export function LoyaltyFlow({ eyebrow, title, steps, accent = "cyan" }: LoyaltyFlowProps) {
  const labels = ["Behavior", "Rules", "Currency", "Rewards", "Delivery", "Measurement"];
  const tones = [
    {
      line: "bg-gradient-to-r from-[#e44c44] via-[#ff847d] to-transparent",
      border: "border-[#e44c44]/20",
      glow: "shadow-[0_20px_50px_rgba(228,76,68,0.08)]",
      dot: "bg-[#e44c44]"
    },
    {
      line: "bg-gradient-to-r from-[#549c24] via-[#89d35d] to-transparent",
      border: "border-[#549c24]/20",
      glow: "shadow-[0_20px_50px_rgba(84,156,36,0.08)]",
      dot: "bg-[#549c24]"
    },
    {
      line: "bg-gradient-to-r from-[#2e636b] via-[#5fadb7] to-transparent",
      border: "border-[#2e636b]/20",
      glow: "shadow-[0_20px_50px_rgba(46,99,107,0.08)]",
      dot: "bg-[#2e636b]"
    },
    {
      line: "bg-gradient-to-r from-[#3d284c] via-[#8f63b0] to-transparent",
      border: "border-[#3d284c]/24",
      glow: "shadow-[0_20px_50px_rgba(61,40,76,0.08)]",
      dot: "bg-[#3d284c]"
    },
    {
      line: "bg-gradient-to-r from-[#e44c44] via-[#2e636b] to-transparent",
      border: "border-[#2e636b]/20",
      glow: "shadow-[0_20px_50px_rgba(46,99,107,0.08)]",
      dot: "bg-[#e44c44]"
    },
    {
      line: "bg-gradient-to-r from-[#549c24] via-[#3d284c] to-transparent",
      border: "border-[#3d284c]/24",
      glow: "shadow-[0_20px_50px_rgba(61,40,76,0.08)]",
      dot: "bg-[#549c24]"
    }
  ];

  return (
    <section className="section-space">
      <div className="container-shell">
        <div className={cn("section-kicker", getSectionKickerAccentClass(accent))}>{eyebrow}</div>
        <h2 className="headline-balance max-w-4xl font-display text-4xl font-semibold text-white sm:text-5xl">
          {title}
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-6">
          {labels.map((label, index) => (
            <div
              className={cn(
                "relative overflow-hidden rounded-[28px] border bg-white/5 p-5",
                tones[index].border,
                tones[index].glow
              )}
              key={label}
            >
              <div className={cn("absolute inset-x-0 top-0 h-1", tones[index].line)} />
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">0{index + 1}</div>
              <div className="mt-3 flex items-center gap-3">
                <span className={cn("h-2.5 w-2.5 rounded-full", tones[index].dot)} />
                <div className="font-display text-xl font-semibold text-white">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {steps.map((step) => (
            <div className="rounded-3xl border border-white/10 bg-white/4 px-5 py-4 text-sm leading-7 text-slate-300" key={step}>
              {step}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
