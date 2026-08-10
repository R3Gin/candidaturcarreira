import { useEffect, useRef, useState } from "react";

export const ADSENSE_CLIENT = "ca-pub-1242374726754221";

const VERTICAL_SLOT = "4645487824";

type AdSlotVerticalProps = {
  className?: string;
  label?: string;
  /** Altura mínima do bloco antes do anúncio carregar */
  minHeight?: number;
};

/**
 * Anúncio vertical AdSense (formato autorelaxed).
 * Ideal para sidebars e colunas laterais sem atrapalhar o fluxo principal.
 */
export function AdSlotVertical({
  className = "",
  label = "Publicidade",
  minHeight = 280,
}: AdSlotVerticalProps) {
  const mounted = useMounted();

  return (
    <aside
      aria-label={label}
      className={`rounded-2xl border border-border bg-card/60 p-3 ${className}`}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {mounted ? (
        <AdSenseVerticalIns minHeight={minHeight} />
      ) : (
        <div
          className="w-full animate-pulse rounded-xl bg-muted"
          style={{ minHeight }}
        />
      )}
    </aside>
  );
}

function AdSenseVerticalIns({ minHeight }: { minHeight: number }) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || pushed.current) return;
    pushed.current = true;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      /* adsense indisponível (bloqueador ou dev) */
    }
  }, [ready]);

  return (
    <ins
      ref={ref}
      className="adsbygoogle block w-full"
      style={{ display: "block", minHeight }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={VERTICAL_SLOT}
      data-ad-format="autorelaxed"
      data-full-width-responsive="false"
    />
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
