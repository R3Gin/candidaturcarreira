import { useEffect } from "react";

export const ADSENSE_CLIENT = "ca-pub-1242374726754221";

/**
 * Carrega o script do Google AdSense apenas no cliente, após a hidratação.
 * Isso evita hydration mismatch causado pelo AdSense reescrever o DOM
 * enquanto o React ainda está hidratando a árvore.
 */
export function AdSenseScript() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.querySelector(`script[src*="${ADSENSE_CLIENT}"]`)) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  return null;
}
