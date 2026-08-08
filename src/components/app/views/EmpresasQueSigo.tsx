import { Building2, Star } from "lucide-react";
import { useAppStore } from "../store";
import { EmptyState, PageHead } from "./ui";

export function EmpresasQueSigo({ onGoToJobs }: { onGoToJobs: () => void }) {
  const { followed, toggleFollow } = useAppStore();

  return (
    <div className="space-y-5">
      <PageHead
        eyebrow="Empresas que sigo"
        title="Empresas com quem você interagiu"
        subtitle="Aparecem aqui as empresas em que você iniciou um processo seletivo, deixou um feedback ou escolheu seguir."
      />

      {followed.length === 0 ? (
        <EmptyState
          title="Você ainda não segue empresas"
          description="Ao iniciar um processo seletivo ou avaliar uma empresa, ela entra automaticamente nesta lista."
          actionLabel="Conhecer empresas"
          onAction={onGoToJobs}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {followed.map((c) => (
            <article key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary font-display text-sm font-bold text-ink">
                  {c.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-semibold text-ink">{c.name}</h3>
                  <p className="text-xs text-ink-soft">{c.segment}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-ink">
                  <Star className="h-3 w-3 fill-accent text-accent" />
                  {c.rating.toFixed(1)}
                </span>
              </div>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-soft">
                <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                {c.reason} · {c.since}
              </p>
              <button
                type="button"
                onClick={() => toggleFollow(c)}
                className="mt-4 w-full rounded-full border border-border py-2 text-xs font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                Deixar de seguir
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
