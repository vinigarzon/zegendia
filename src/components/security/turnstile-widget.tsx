"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile (bot protection). The site key is public; the secret key lives only in Netlify
// (TURNSTILE_SECRET_KEY) and the server enforces the check only when that secret is configured.
const DEFAULT_TURNSTILE_SITE_KEY = "0x4AAAAAAFp18V3alYPbOQPV";
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || DEFAULT_TURNSTILE_SITE_KEY;

type TurnstileApi = {
  remove: (widgetId: string) => void;
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<void> | null = null;

function loadTurnstile() {
  if (window.turnstile) {
    return Promise.resolve();
  }

  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Could not load Turnstile"));
      };
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

type TurnstileWidgetProps = {
  appearance?: "always" | "interaction-only";
  className?: string;
  language: "es" | "en";
  onToken: (token: string) => void;
  /** Change this number to reset the widget (tokens are single-use). */
  resetKey?: number;
  size?: "normal" | "flexible" | "compact";
};

export function TurnstileWidget({
  appearance = "always",
  className,
  language,
  onToken,
  resetKey,
  size = "flexible"
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !containerRef.current) {
      return;
    }

    let cancelled = false;

    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) {
          return;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          appearance,
          callback: (token: string) => onTokenRef.current(token),
          "error-callback": () => onTokenRef.current(""),
          "expired-callback": () => onTokenRef.current(""),
          language,
          "response-field": false,
          sitekey: TURNSTILE_SITE_KEY,
          size
        });
      })
      .catch(() => onTokenRef.current(""));

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
      onTokenRef.current("");
    };
  }, [appearance, language, size]);

  useEffect(() => {
    if (resetKey === undefined || !widgetIdRef.current || !window.turnstile) {
      return;
    }

    onTokenRef.current("");
    window.turnstile.reset(widgetIdRef.current);
  }, [resetKey]);

  if (!TURNSTILE_SITE_KEY) {
    return null;
  }

  return <div className={className} ref={containerRef} />;
}
