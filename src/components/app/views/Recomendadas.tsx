import { BadgeCheck, Bookmark, MapPin, Sparkles, Star, Zap } from "lucide-react";
import { useAppStore } from "../store";
import { EmptyState, PageHead } from "./ui";

export function Recomendadas({
  onGoToJobs,
  onGoToPreferences,
}: {
  onGoToJobs: () => void;
  onGoToPreferences: () => void;
}) {
  const { recommendations, preferences, isSaved, toggleSaved, hasApplied } = useAppStore();
  const top = recommendations.slice(0, 6);

  return (
    <div className="space-y-5">
      <PageHead
        eyebrow="Recomendação inteligente"
        title="Vagas escolhidas pelo seu perfil"
        subtitle="O Candidatu cruza suas preferências, habilidades do currículo e histórico de ações para ranquear as vagas com maior chance de retorno."
      />

      {!preferences && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-mint p-4">
          <p className="text-sm font-semibold text-ink">
            Preencha suas preferências para deixar as recomendações muito mais precisas.
          </p>
          <button
            type="button"
            onClick={onGoToPreferences}
            className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground"
          >
            Definir preferências
          </button>
        </div>
      )}

      {top.length === 0 ? (
        <EmptyState
          title="Sem recomendações no momento"
          description="Interaja com algumas vagas para o motor de recomendação aprender o seu perfil."
          actionLabel="Ver vagas"
          onAction={onGoToJobs}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {top.map(({ job, score, reasons }) => (
            <article
              key={job.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-soft">
                    {job.company}
                    <span className="inline-flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      {job.rating.toFixed(1)}
                    </span>
                  </p>
                  <h3 className="mt-1 font-display text-base font-semibold text-ink">{job.role}</h3>
                </div>
                <span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-ink">
                  {score}% match
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {job.city}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-ink">
                  <BadgeCheck className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                  {job.salary}
                </span>
              </div>

              <ul className="mt-3 space-y-1.5">
                {reasons.map((r) => (
                  <li key={r} className="flex gap-2 text-xs text-ink-soft">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
                    {r}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={onGoToJobs}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  <Zap className="h-3.5 w-3.5" strokeWidth={2} />
                  {hasApplied(job.id) ? "Ver processo" : "Candidatar-se"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleSaved(job.id)}
                  aria-label={isSaved(job.id) ? "Remover das salvas" : "Salvar vaga"}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft"
                >
                  <Bookmark
                    className={`h-4 w-4 ${isSaved(job.id) ? "fill-accent text-accent" : ""}`}
                    strokeWidth={1.75}
                  />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
