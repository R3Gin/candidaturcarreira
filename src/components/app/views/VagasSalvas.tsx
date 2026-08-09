import { BadgeCheck, Bookmark, MapPin, Star } from "lucide-react";
import { useAppStore } from "../store";
import { EmptyState, PageHead } from "./ui";

export function VagasSalvas({ onGoToJobs }: { onGoToJobs: () => void }) {
  const { jobs, savedJobs, toggleSaved } = useAppStore();
  const list = jobs.filter((j) => savedJobs.includes(j.id));

  return (
    <div className="space-y-5">
      <PageHead
        eyebrow="Vagas salvas"
        title={`${list.length} ${list.length === 1 ? "vaga salva" : "vagas salvas"}`}
        subtitle="Tudo que você marca com o ícone de salvar na central de vagas aparece nesta tabela."
      />

      {list.length === 0 ? (
        <EmptyState
          title="Você ainda não salvou vagas"
          description="Na central de vagas, toque no ícone de marcador de qualquer vaga para guardá-la aqui."
          actionLabel="Ir para a central de vagas"
          onAction={onGoToJobs}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="hidden grid-cols-[1fr_180px_160px_60px] gap-4 border-b border-border bg-secondary px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-soft md:grid">
            <span>Vaga</span>
            <span>Local</span>
            <span>Faixa salarial</span>
            <span className="text-right">Ação</span>
          </div>
          <ul className="divide-y divide-border">
            {list.map((j) => (
              <li
                key={j.id}
                className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_180px_160px_60px] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-ink">{j.role}</p>
                  <p className="mt-0.5 inline-flex items-center gap-2 text-xs text-ink-soft">
                    {j.company}
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      {j.rating.toFixed(1)}
                    </span>
                    <span className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-bold text-ink">
                      {j.match}
                    </span>
                  </p>
                </div>
                <p className="inline-flex items-center gap-1 text-xs text-ink-soft">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {j.city}
                </p>
                <p className="inline-flex items-center gap-1 text-xs font-semibold text-ink">
                  <BadgeCheck className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                  {j.salary}
                </p>
                <div className="md:text-right">
                  <button
                    type="button"
                    aria-label={`Remover ${j.role} das vagas salvas`}
                    onClick={() => toggleSaved(j.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-accent hover:bg-secondary"
                  >
                    <Bookmark className="h-4.5 w-4.5 fill-accent" strokeWidth={1.75} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
