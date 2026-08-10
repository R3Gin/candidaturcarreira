import { useEffect, useRef } from "react";

export const ADSENSE_CLIENT = "ca-pub-1242374726754221";

type AdSlotProps = {
  /** ID do bloco de anúncio criado no painel do AdSense */
  slot?: string;
  format?: string;
  className?: string;
  label?: string;
};

/**
 * Bloco de anúncio do Google AdSense.
 * O script global é carregado em src/routes/__root.tsx.
 */
export function AdSlot({
  slot,
  format = "auto",
  className = "",
  label = "Publicidade",
}: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      /* adsense indisponível (bloqueador ou dev) */
    }
  }, []);

  return (
    <aside
      aria-label={label}
      className={`mx-auto w-full max-w-6xl px-5 ${className}`}
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card/60 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <ins
          ref={ref}
          className="adsbygoogle block min-h-[90px] w-full"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          {...(slot ? { "data-ad-slot": slot } : {})}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
