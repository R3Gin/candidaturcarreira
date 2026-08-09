import { useMemo, useState } from "react";
import { BadgeCheck, Building2, Clock, MapPin, Star, TrendingUp } from "lucide-react";
import { stageNames, useAppStore } from "../store";
import { Chip, EmptyState, PageHead } from "./ui";

const filters = ["Todas", "Deram procedência", "Aguardando", "Finalizadas"] as const;

export function MinhasCandidaturas({ onGoToJobs }: { onGoToJobs: () => void }) {
  const { applications, advance, withdraw } = useAppStore();
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todas");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    if (filter === "Deram procedência")
      return applications.filter((a) => a.stage >= 2 && a.stage < 4);
    if (filter === "Aguardando") return applications.filter((a) => a.stage < 2);
    if (filter === "Finalizadas") return applications.filter((a) => a.stage >= 4);
    return applications;
  }, [filter, applications]);

  const advanced = applications.filter((a) => a.stage >= 2).length;

  return (
    <div className="space-y-5">
      <PageHead
        eyebrow="Minhas candidaturas"
        title="Quem está dando procedência no seu perfil"
        subtitle="Cada card mostra a etapa atual, o próximo passo com data e o retorno que a empresa registrou."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric
          label="Candidaturas ativas"
          value={String(applications.filter((a) => a.stage < 4).length)}
          hint="em processos abertos"
        />
        <Metric label="Avançaram de etapa" value={String(advanced)} hint="empresas deram procedência" />
        <Metric
          label="Taxa de avanço"
          value={applications.length ? `${Math.round((advanced / applications.length) * 100)}%` : "0%"}
          hint="dos seus envios"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Chip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="Nenhuma candidatura neste filtro"
          description="Use a candidatura rápida na central de vagas: cada envio aparece aqui com etapa e retorno da empresa."
          actionLabel="Buscar oportunidades"
          onAction={onGoToJobs}
        />
      ) : (
        <div className="space-y-3">
          {list.map((a) => {
            const open = openId === a.id;
            return (
              <article
                key={a.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-3 sm:flex sm:flex-nowrap">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary font-display text-sm font-bold text-ink">
                    {a.company.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 sm:flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-ink-soft">
                      <span className="inline-flex min-w-0 items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                        <span className="truncate">{a.company}</span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        {a.rating.toFixed(1)}
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-base font-semibold leading-snug text-ink sm:text-lg">
                      {a.role}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                        {a.city}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-ink">
                        <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
                        {a.salary}
                      </span>
                    </div>
                  </div>
                  <span className="col-start-2 w-fit shrink-0 rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-ink sm:col-auto">
                    {stageNames[a.stage]}
                  </span>
                </div>


                <div className="mt-4 grid gap-1.5 sm:grid-cols-5">
                  {stageNames.map((s, i) => (
                    <div key={s}>
                      <div
                        className={`h-1.5 rounded-full ${i <= a.stage ? "bg-accent" : "bg-secondary"}`}
                      />
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
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : a.id)}
                      className="text-xs font-semibold text-accent"
                    >
                      {open ? "Ocultar processo" : "Ver processo"}
                    </button>
                    {a.stage < stageNames.length - 1 && (
                      <button
                        type="button"
                        onClick={() => advance(a.id)}
                        className="text-xs font-semibold text-ink-soft hover:text-accent"
                      >
                        Registrar avanço
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => withdraw(a.id)}
                      className="text-xs font-semibold text-ink-soft hover:text-destructive"
                    >
                      Desistir
                    </button>
                  </div>
                </div>

                {open && (
                  <div className="mt-3 space-y-3 rounded-2xl bg-secondary p-4 text-sm text-ink-soft">
                    <p className="inline-flex items-center gap-1.5 font-semibold text-ink">
                      <TrendingUp className="h-4 w-4 text-accent" strokeWidth={2} />
                      {a.feedback}
                    </p>
                    <p>Próximo passo: {a.next}</p>

                    {a.qualifications && a.qualifications.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-ink">Qualificações enviadas</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {a.qualifications.map((q) => (
                            <span
                              key={q}
                              className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-ink-soft"
                            >
                              {q}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {a.letter && (
                      <div>
                        <p className="text-xs font-bold text-ink">Sua mensagem à empresa</p>
                        <p className="mt-1 rounded-xl bg-card p-3 text-xs italic">{a.letter}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-bold text-ink">Linha do tempo do processo</p>
                      <ol className="mt-2 space-y-2.5">
                        {(a.events ?? []).map((ev, i, arr) => (
                          <li key={ev.id} className="relative flex gap-3 pl-1">
                            {i < arr.length - 1 && (
                              <span className="absolute left-[9px] top-5 h-full w-px bg-border" />
                            )}
                            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                            <span className="min-w-0">
                              <span className="block text-xs font-semibold text-ink">
                                {ev.label}
                              </span>
                              <span className="block text-[11px]">{ev.note}</span>
                              <span className="block text-[11px] text-muted-foreground">
                                {new Date(ev.at).toLocaleString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </span>
                          </li>
                        ))}
                        {(a.events ?? []).length === 0 && (
                          <li className="text-[11px] text-muted-foreground">
                            Sem eventos registrados para esta candidatura.
                          </li>
                        )}
                      </ol>
                    </div>
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
