import * as React from "react";
import type { Route } from "next";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

import { cn, isExternalHref } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "bg-cyan-300 px-5 py-3 text-slate-950 shadow-cyan hover:bg-cyan-200",
        brandWarm:
          "bg-[#e44c44] px-5 py-3 text-white shadow-[0_18px_40px_rgba(228,76,68,0.28)] hover:bg-[#ec5f57]",
        brandGreen:
          "bg-[#549c24] px-5 py-3 text-white shadow-[0_18px_40px_rgba(84,156,36,0.28)] hover:bg-[#61aa31]",
        secondary:
          "border border-white/15 bg-white/5 px-5 py-3 text-white hover:bg-white/10",
        ghost: "px-0 py-0 text-cyan-200 hover:text-cyan-100",
        dark: "bg-slate-950 px-5 py-3 text-white hover:bg-slate-800"
      },
      size: {
        default: "",
        lg: "px-6 py-3.5 text-base",
        sm: "px-4 py-2.5 text-xs uppercase tracking-[0.18em]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";

type LinkButtonProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
};

export function LinkButton({ href, className, children, variant, size }: LinkButtonProps) {
  if (isExternalHref(href)) {
    return (
      <a
        className={cn(buttonVariants({ variant, size, className }))}
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={cn(buttonVariants({ variant, size, className }))} href={href as Route}>
      {children}
    </Link>
  );
}
