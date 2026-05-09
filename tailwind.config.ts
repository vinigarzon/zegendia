import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        glow: "0 0 80px rgba(61, 255, 246, 0.18)",
        cyan: "0 24px 60px rgba(42, 208, 255, 0.18)",
        magenta: "0 24px 60px rgba(198, 83, 255, 0.18)"
      },
      backgroundImage: {
        "mesh-dark":
          "radial-gradient(circle at top left, rgba(70, 222, 255, 0.18), transparent 28%), radial-gradient(circle at 75% 10%, rgba(168, 85, 247, 0.18), transparent 22%), radial-gradient(circle at 90% 70%, rgba(249, 115, 22, 0.16), transparent 18%), linear-gradient(135deg, rgba(6, 11, 28, 1) 0%, rgba(11, 19, 43, 1) 46%, rgba(17, 24, 39, 1) 100%)",
        "mesh-light":
          "radial-gradient(circle at top left, rgba(34, 211, 238, 0.18), transparent 22%), radial-gradient(circle at 80% 0%, rgba(217, 70, 239, 0.12), transparent 20%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)"
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        "float-slow": "float-slow 8s ease-in-out infinite",
        shimmer: "shimmer 8s linear infinite"
      }
    }
  },
  plugins: [tailwindcssAnimate, typography]
};

export default config;
