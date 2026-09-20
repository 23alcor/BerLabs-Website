"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      remove: (widgetId: string) => void;
      render: (
        container: HTMLElement,
        options: { action: string; callback: (token: string) => void; sitekey: string; theme: string },
      ) => string;
    };
  }
}

type TurnstileWidgetProps = {
  onToken: (token: string) => void;
  siteKey: string;
};

export function TurnstileWidget({ onToken, siteKey }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const render = () => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        action: "newsletter_signup",
        callback: onToken,
        sitekey: siteKey,
        theme: "dark",
      });
    };

    const existingScript = document.getElementById("turnstile-script");
    if (window.turnstile) render();
    else if (existingScript) existingScript.addEventListener("load", render);
    else {
      const script = document.createElement("script");
      script.id = "turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", render);
      document.head.appendChild(script);
    }

    return () => {
      if (existingScript) existingScript.removeEventListener("load", render);
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [onToken, siteKey]);

  return <div className="mt-4 min-h-[65px]" ref={containerRef} />;
}
