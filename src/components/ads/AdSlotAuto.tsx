import { useEffect, useRef, useState } from "react";

export const ADSENSE_CLIENT = "ca-pub-1242374726754221";

const AUTO_SLOT = "3491620037";

type AdSlotAutoProps = {
  className?: string;
  label?: string;
  /** Altura mínima do bloco antes do anúncio carregar */
  minHeight?: number;
};

/**
 * Bloco de anúncio AdSense responsivo (formato auto, full width).
 * Equivalente ao snippet:
 * <!-- adsense 2 -->
 * <ins class="adsbygoogle"
 *      style="display:block"
 *      data-ad-client="ca-pub-1242374726754221"
 *      data-ad-slot="3491620037"
 *      data-ad-format="auto"
 *      data-full-width-responsive="true"></ins>
 */
export function AdSlotAuto({
  className = "",
  label = "Publicidade",
  minHeight = 90,
}: AdSlotAutoProps) {
  const mounted = useMounted();

  return (
    <aside
      aria-label={label}
      className={`mx-auto w-full max-w-6xl px-5 ${className}`}
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card/60 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {mounted ? (
          <AdSenseAutoIns minHeight={minHeight} />
        ) : (
          <div
            className="w-full animate-pulse rounded-xl bg-muted"
            style={{ minHeight }}
          />
        )}
      </div>
    </aside>
  );
}

function AdSenseAutoIns({ minHeight }: { minHeight: number }) {
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
      data-ad-slot={AUTO_SLOT}
      data-ad-format="auto"
      data-full-width-responsive="true"
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
