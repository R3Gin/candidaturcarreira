import { useMemo, useState } from "react";
import { BadgeCheck, Building2, Clock, MapPin, Star, TrendingUp } from "lucide-react";
import { applications, stageNames } from "../store";
import { Chip, EmptyState, PageHead } from "./ui";

const filters = ["Todas", "Deram procedência", "Aguardando", "Finalizadas"] as const;

export function MinhasCandidaturas({ onGoToJobs }: { onGoToJobs: () => void }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todas");
  const [openId, setOpenId] = useState<string | null>(applications[0]?.id ?? null);

  const list = useMemo(() => {
    if (filter === "Deram procedência") return applications.filter((a) => a.stage >= 2 && a.stage < 4);
    if (filter === "Aguardando") return applications.filter((a) => a.stage < 2);
    if (filter === "Finalizadas") return applications.filter((a) => a.stage >= 4);
    return applications;
  }, [filter]);

  const advanced = applications.filter((a) => a.stage >= 2).length;

  return (
    <div className="space-y-5">
      <PageHead
        eyebrow="Minhas candidaturas"
        title="Quem está dando procedência no seu perfil"
        subtitle="Cada card mostra a etapa atual, o próximo passo com data e o retorno que a empresa registrou."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Candidaturas ativas" value={String(applications.filter((a) => a.stage < 4).length)} hint="em processos abertos" />
        <Metric label="Avançaram de etapa" value={String(advanced)} hint="empresas deram procedência" />
        <Metric label="Taxa de avanço" value={`${Math.round((advanced / applications.length) * 100)}%`} hint="dos seus envios" />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Chip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="Nenhuma candidatura neste filtro"
          description="Assim que uma empresa mover seu perfil de etapa, ela aparece aqui com o motivo do retorno."
          actionLabel="Buscar oportunidades"
          onAction={onGoToJobs}
        />
      ) : (
        <div className="space-y-3">
          {list.map((a) => {
            const open = openId === a.id;
            return (
              <article key={a.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex flex-wrap items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary font-display text-sm font-bold text-ink">
                    {a.company.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
                      <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {a.company}
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        {a.rating.toFixed(1)}
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-lg font-semibold text-ink">{a.role}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {a.city}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-ink">
                        <BadgeCheck className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                        {a.salary}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-ink">
                    {stageNames[a.stage]}
                  </span>
                </div>

                <div className="mt-4 grid gap-1.5 sm:grid-cols-5">
                  {stageNames.map((s, i) => (
                    <div key={s}>
                      <div className={`h-1.5 rounded-full ${i <= a.stage ? "bg-accent" : "bg-secondary"}`} />
                      <p
                        className={`mt-1.5 text-[11px] font-semibold ${
                          i <= a.stage ? "text-ink" : "text-muted-foreground"
                        }`}
                      >
                        {s}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {a.updated}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : a.id)}
                    className="text-xs font-semibold text-accent"
                  >
                    {open ? "Ocultar processo" : "Ver processo"}
                  </button>
                </div>

                {open && (
                  <div className="mt-3 space-y-2 rounded-2xl bg-secondary p-4 text-sm text-ink-soft">
                    <p className="inline-flex items-center gap-1.5 font-semibold text-ink">
                      <TrendingUp className="h-4 w-4 text-accent" strokeWidth={2} />
                      {a.feedback}
                    </p>
                    <p>Próximo passo: {a.next}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
