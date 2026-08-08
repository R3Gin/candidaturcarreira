import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Bookmark,
  Building2,
  Check,
  Clock,
  Heart,
  MapPin,
  Star,
  Zap,
} from "lucide-react";
import { companyFromJob, jobPool, useAppStore, type Job } from "../store";
import { toast } from "sonner";
import {
  JobFilterBar,
  emptyFilters,
  filterJobs,
  jobAreas,
  type JobFilterState,
} from "./JobFilters";

const flowSteps = ["Qualificações", "Dados", "Mensagem", "Revisão"];

export function CentralVagas({ onGoToApplications }: { onGoToApplications: () => void }) {
  const { savedJobs, toggleSaved, followed, toggleFollow, applyToJob, hasApplied } = useAppStore();
  const [filters, setFilters] = useState<JobFilterState>(emptyFilters);

  const list = useMemo(() => filterJobs(jobPool, filters), [filters]);

  const companies = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const map = new Map<string, { job: Job; count: number }>();
    for (const j of jobPool) {
      if (filters.hiddenCompanies.includes(j.company)) continue;
      if (q && !`${j.company} ${j.segment}`.toLowerCase().includes(q)) continue;
      const prev = map.get(j.company);
      map.set(j.company, { job: prev?.job ?? j, count: (prev?.count ?? 0) + 1 });
    }
    return [...map.values()];
  }, [filters.query, filters.hiddenCompanies]);

  const [selectedId, setSelectedId] = useState<string>(jobPool[0]!.id);
  const selected = list.find((j) => j.id === selectedId) ?? list[0] ?? null;

  const resultLabel =
    filters.mode === "empresas"
      ? `${companies.length} ${companies.length === 1 ? "empresa encontrada" : "empresas encontradas"}`
      : `${list.length} ${list.length === 1 ? "vaga encontrada" : "vagas encontradas"} · use a candidatura rápida para enviar seu currículo em um clique`;

  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">Central de empregabilidade</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          Vagas, empresas e candidatura rápida
        </h1>
      </header>

      <JobFilterBar filters={filters} onChange={setFilters} resultLabel={resultLabel} />

      {filters.mode === "empresas" ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map(({ job, count }) => {
            const company = companyFromJob(job);
            const following = followed.some((c) => c.id === company.id);
            return (
              <li
                key={job.company}
                className="rounded-2xl border border-border bg-card p-4 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary font-display text-sm font-bold text-ink">
                    {job.company.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold text-ink">
                      {job.company}
                    </p>
                    <p className="truncate text-[11px] text-ink-soft">{job.segment}</p>
                  </div>
                </div>
                <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-ink">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  {job.rating.toFixed(1)} · {count} {count === 1 ? "vaga aberta" : "vagas abertas"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {jobAreas(job).map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-ink-soft"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFollow(company)}
                    className={`rounded-full px-4 py-2 text-xs font-bold ${
                      following
                        ? "border border-accent text-accent"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {following ? "Seguindo" : "Seguir empresa"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ ...filters, mode: "vagas", query: job.company });
                      setSelectedId(job.id);
                    }}
                    className="text-xs font-semibold text-accent"
                  >
                    Ver vagas
                  </button>
                </div>
              </li>
            );
          })}
          {companies.length === 0 && (
            <li className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-ink-soft">
              Nenhuma empresa com esses filtros.
            </li>
          )}
        </ul>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
          <ul className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
            {list.map((j) => {
              const active = selected?.id === j.id;
              return (
                <li key={j.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(j.id)}
                    className={`w-full rounded-2xl border bg-card p-4 text-left shadow-card transition-colors ${
                      active ? "border-accent" : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-soft">
                        {j.company}
                        <span className="inline-flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-accent text-accent" />
                          {j.rating.toFixed(1)}
                        </span>
                      </span>
                      <Bookmark
                        className={`h-4 w-4 ${savedJobs.includes(j.id) ? "fill-accent text-accent" : "text-ink-soft"}`}
                        strokeWidth={1.75}
                      />
                    </div>
                    <p className="mt-1 font-display text-sm font-semibold text-ink">{j.role}</p>
                    <p className="text-[11px] text-ink-soft">{j.city}</p>
                    <p className="mt-1 text-[11px] font-semibold text-ink">{j.salary}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {j.quickApply ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent">
                          <Zap className="h-3 w-3" strokeWidth={2} />
                          Candidatura rápida
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Formulário da empresa
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground">{j.posted}</span>
                    </div>
                    {hasApplied(j.id) && (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-ink">
                        <Check className="h-3 w-3" strokeWidth={2.5} /> Candidatura enviada
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
            {list.length === 0 && (
              <li className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-ink-soft">
                Nenhuma vaga com esses filtros.
              </li>
            )}
          </ul>

          {selected && (
            <JobDetail
              key={selected.id}
              job={selected}
              saved={savedJobs.includes(selected.id)}
              onToggleSaved={() => toggleSaved(selected.id)}
              following={followed.some((c) => c.id === companyFromJob(selected).id)}
              onToggleFollow={() => toggleFollow(companyFromJob(selected))}
              applied={hasApplied(selected.id)}
              onApply={(extra) => applyToJob(selected, extra)}
              onGoToApplications={onGoToApplications}
            />
          )}
        </div>
      )}
    </div>
  );
}


function JobDetail({
  job,
  saved,
  onToggleSaved,
  following,
  onToggleFollow,
  applied,
  onApply,
  onGoToApplications,
}: {
  job: Job;
  saved: boolean;
  onToggleSaved: () => void;
  following: boolean;
  onToggleFollow: () => void;
  applied: boolean;
  onApply: (extra: { letter: string; qualifications: string[] }) => void;
  onGoToApplications: () => void;
}) {
  const [step, setStep] = useState<number | null>(null);
  const { account, resume } = useAppStore();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [letter, setLetter] = useState("");

  const allChecked = job.qualifications.every((q) => answers[q]);
  const checked = job.qualifications.filter((q) => answers[q]);


  return (
    <article className="max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary font-display text-sm font-bold text-ink">
          {job.company.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
            <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            {job.company}
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
              <Star className="h-3 w-3 fill-accent text-accent" />
              {job.rating.toFixed(1)}
            </span>
          </div>
          <h2 className="mt-1 font-display text-xl font-bold text-ink">{job.role}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
              {job.city}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-ink">
              <BadgeCheck className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
              {job.salary}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
              Publicada {job.posted}
            </span>
          </div>
        </div>
        <span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-ink">
          {job.match} de match
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {applied ? (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-4 py-2.5 text-sm font-bold text-ink">
              <Check className="h-4 w-4" strokeWidth={2.5} />
              Candidatura enviada
            </span>
            <button
              type="button"
              onClick={onGoToApplications}
              className="text-xs font-semibold text-accent"
            >
              Acompanhar processo
            </button>
          </>
        ) : step === null ? (
          <button
            type="button"
            onClick={() => setStep(0)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.96]"
          >
            {job.quickApply ? <Zap className="h-4 w-4" strokeWidth={2} /> : null}
            {job.quickApply ? "Candidatura rápida" : "Candidatar-se"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onToggleSaved}
          aria-label={saved ? "Remover das vagas salvas" : "Salvar vaga"}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-border ${
            saved ? "text-accent" : "text-ink-soft"
          }`}
        >
          <Bookmark className={`h-4.5 w-4.5 ${saved ? "fill-accent" : ""}`} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onToggleFollow}
          aria-label={following ? `Deixar de seguir ${job.company}` : `Seguir ${job.company}`}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-border ${
            following ? "text-accent" : "text-ink-soft"
          }`}
        >
          <Heart className={`h-4.5 w-4.5 ${following ? "fill-accent" : ""}`} strokeWidth={1.75} />
        </button>
      </div>

      {!applied && step !== null && (
        <div className="mt-4 rounded-2xl border border-border bg-secondary p-4">
          <div className="flex items-center gap-1.5">
            {flowSteps.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full ${i <= step ? "bg-accent" : "bg-card"}`} />
                <p
                  className={`mt-1 text-[10px] font-bold ${
                    i <= step ? "text-ink" : "text-muted-foreground"
                  }`}
                >
                  {s}
                </p>
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="mt-4">
              <p className="font-display text-base font-semibold text-ink">
                Suas qualificações para esta vaga
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                Marque o que você tem: a empresa usa isso na triagem.
              </p>
              <div className="mt-3 space-y-2">
                {job.qualifications.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q]: !a[q] }))}
                    className={`flex w-full items-center gap-2 rounded-xl border bg-card px-3 py-2 text-left text-sm font-medium ${
                      answers[q] ? "border-accent text-ink" : "border-border text-ink-soft"
                    }`}
                  >
                    <span
                      className={`flex h-4.5 w-4.5 items-center justify-center rounded border ${
                        answers[q]
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border"
                      }`}
                    >
                      {answers[q] && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    {q}
                  </button>
                ))}
              </div>
              {!allChecked && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Você pode seguir mesmo sem marcar todas.
                </p>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="mt-4 space-y-2">
              <p className="font-display text-base font-semibold text-ink">
                Confirme seus dados de contato
              </p>
              <div className="space-y-1.5 rounded-xl bg-card p-3 text-sm text-ink-soft">
                <p>
                  <span className="font-semibold text-ink">Nome:</span> {account.name}
                </p>
                <p>
                  <span className="font-semibold text-ink">E-mail:</span> {account.email}
                </p>
                <p>
                  <span className="font-semibold text-ink">Telefone:</span> {account.phone}
                </p>
                <p>
                  <span className="font-semibold text-ink">Currículo:</span>{" "}
                  {resume ? resume.headline : "Currículo padrão do perfil"}
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Esses dados serão compartilhados com {job.company}.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="mt-4">
              <p className="font-display text-base font-semibold text-ink">
                Mensagem para a empresa (opcional)
              </p>
              <textarea
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                rows={4}
                placeholder={`Conte em poucas linhas por que a vaga de ${job.role} faz sentido para você.`}
                className="mt-2 w-full rounded-xl border border-border bg-card p-3 text-sm text-ink outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() =>
                  setLetter(
                    `Tenho interesse na vaga de ${job.role} na ${job.company}. Minha experiência com ${
                      job.qualifications[0] ?? "a área"
                    } e o foco em resultados podem ajudar o time desde o primeiro mês. Fico à disposição para conversar.`,
                  )
                }
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent"
              >
                <Zap className="h-3.5 w-3.5" strokeWidth={2} />
                Sugerir texto automaticamente
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="mt-4 space-y-2 text-sm text-ink-soft">
              <p className="font-display text-base font-semibold text-ink">Revisão final</p>
              <p>
                <span className="font-semibold text-ink">Vaga:</span> {job.role} · {job.company}
              </p>
              <p>
                <span className="font-semibold text-ink">Qualificações marcadas:</span>{" "}
                {checked.length ? checked.join(", ") : "nenhuma"}
              </p>
              <p>
                <span className="font-semibold text-ink">Mensagem:</span>{" "}
                {letter.trim() ? `"${letter.trim().slice(0, 120)}"` : "sem mensagem"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Ao enviar, a candidatura entra em Minhas candidaturas com etapas e histórico.
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {step < flowSteps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform active:scale-[0.96]"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onApply({ letter: letter.trim(), qualifications: checked });
                  setStep(null);
                  toast.success(`Candidatura enviada para ${job.company}`, {
                    description: "Acompanhe cada etapa em Minhas candidaturas.",
                    action: { label: "Acompanhar", onClick: onGoToApplications },
                  });
                }}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.96]"
              >
                Enviar candidatura
              </button>
            )}
            <button
              type="button"
              onClick={() => (step === 0 ? setStep(null) : setStep(step - 1))}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-ink-soft"
            >
              {step === 0 ? "Cancelar" : "Voltar"}
            </button>
          </div>
        </div>
      )}


      <section className="mt-5">
        <h3 className="font-display text-base font-semibold text-ink">Sobre a vaga</h3>
        <p className="mt-1.5 text-sm text-ink-soft">{job.about}</p>
      </section>

      <DetailList title="Responsabilidades" items={job.responsibilities} />
      <DetailList title="Requisitos" items={job.requirements} />

      <section className="mt-5">
        <h3 className="font-display text-base font-semibold text-ink">Benefícios</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {job.benefits.map((b) => (
            <span
              key={b}
              className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-ink-soft"
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl bg-secondary p-4">
        <h3 className="font-display text-base font-semibold text-ink">Visão geral da empresa</h3>
        <p className="mt-1 text-sm text-ink-soft">{job.segment}</p>
        <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-ink">
          <Star className="h-4 w-4 fill-accent text-accent" />
          {job.rating.toFixed(1)} de avaliação de quem trabalha lá
        </p>
      </section>
    </article>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-5">
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {items.map((i) => (
          <li key={i} className="flex gap-2 text-sm text-ink-soft">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {i}
          </li>
        ))}
      </ul>
    </section>
  );
}
