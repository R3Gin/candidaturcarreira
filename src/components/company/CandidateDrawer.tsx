import { CalendarPlus, CheckCircle2, Star, ThumbsDown, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { brl, initials, stages, useCompanyStore, type Candidate } from "./store";

export function CandidateDrawer({
  candidate,
  onClose,
}: {
  candidate: Candidate;
  onClose: () => void;
}) {
  const {
    vacancies,
    moveStage,
    advance,
    reject,
    restore,
    toggleFavorite,
    addNote,
    setScorecard,
    scheduleInterview,
    can,
  } = useCompanyStore();
  const canMove = can("mover_candidato");
  const canReject = can("reprovar_candidato");
  const canSchedule = can("agendar_entrevista");
  const vacancy = vacancies.find((v) => v.id === candidate.vacancyId);
  const [note, setNote] = useState("");
  const [card, setCard] = useState(
    candidate.scorecard ?? { culture: 3, technical: 3, communication: 3 },
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-sm">
      <button type="button" aria-label="Fechar" className="flex-1" onClick={onClose} />
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-card p-6 shadow-lift">
        <div className="flex items-start gap-3">
          <span
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${candidate.avatarTone} font-display text-sm font-bold text-primary-foreground`}
          >
            {initials(candidate.name)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-bold text-ink">{candidate.name}</h2>
            <p className="text-sm text-ink-soft">{candidate.headline}</p>
            <p className="mt-1 text-xs text-ink-soft">
              {candidate.city} · {candidate.model} · pretensão {brl(candidate.salaryExpectation)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel do candidato"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary"
          >
            <X className="h-4.5 w-4.5 text-ink-soft" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-ink">
            {candidate.score}% de match
          </span>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-ink-soft">
            Vaga: {vacancy?.role ?? "—"}
          </span>
          {candidate.rejected && (
            <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
              Reprovado
            </span>
          )}
          <button
            type="button"
            onClick={() => toggleFavorite(candidate.id)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-semibold text-ink-soft hover:border-accent hover:text-accent"
          >
            <Star
              className={`h-3.5 w-3.5 ${candidate.favorite ? "fill-accent text-accent" : ""}`}
            />
            {candidate.favorite ? "No banco de talentos" : "Salvar no banco"}
          </button>
        </div>

        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">Etapa atual</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {stages.map((s) => (
              <button
                key={s}
                type="button"
                disabled={!canMove}
                onClick={() => moveStage(candidate.id, s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                  candidate.stage === s
                    ? "border-brand bg-brand text-primary-foreground"
                    : "border-border text-ink-soft hover:border-brand-cyan hover:text-brand"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {canMove && (
              <button
                type="button"
                onClick={() => {
                  advance(candidate.id);
                  toast.success("Candidato avançou de etapa");
                }}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
              >
                <CheckCircle2 className="h-4 w-4" /> Avançar etapa
              </button>
            )}
            {canReject &&
              (candidate.rejected ? (
                <button
                  type="button"
                  onClick={() => restore(candidate.id)}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-soft"
                >
                  Reativar no processo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    reject(candidate.id);
                    toast("Feedback de reprovação enviado");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive"
                >
                  <ThumbsDown className="h-4 w-4" /> Reprovar com feedback
                </button>
              ))}
            {!canMove && !canReject && (
              <p className="text-xs font-semibold text-ink-soft">
                Seu cargo permite apenas visualizar e comentar este processo.
              </p>
            )}
          </div>
        </section>


        <section className="mt-6 rounded-2xl border border-border p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            Scorecard da avaliação
          </h3>
          <div className="mt-3 space-y-3">
            {(
              [
                ["technical", "Aderência técnica"],
                ["culture", "Fit cultural"],
                ["communication", "Comunicação"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="flex items-center justify-between text-sm text-ink">
                  {label}
                  <strong className="text-brand">{card[key]}/5</strong>
                </span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={card[key]}
                  onChange={(e) => setCard({ ...card, [key]: Number(e.target.value) })}
                  className="mt-1 w-full accent-[oklch(var(--brand-cyan))]"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setScorecard(candidate.id, card);
              toast.success("Scorecard salvo");
            }}
            className="mt-3 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Salvar avaliação
          </button>
        </section>

        <section className={`mt-6 rounded-2xl border border-border p-4 ${canSchedule ? "" : "hidden"}`}>
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            Agendar entrevista
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink"
            />
            <button
              type="button"
              onClick={() => {
                if (!date) {
                  toast.error("Escolha uma data para a entrevista");
                  return;
                }
                scheduleInterview({
                  candidateId: candidate.id,
                  vacancyId: candidate.vacancyId,
                  date,
                  time,
                  kind: "Entrevista RH",
                  interviewer: "Você",
                  link: `meet.candidatu.com/${candidate.id}-${time.replace(":", "")}`,
                });
                toast.success("Entrevista agendada e convite enviado");
              }}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              <CalendarPlus className="h-4 w-4" /> Agendar
            </button>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            Competências
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {candidate.skills.map((s) => (
              <span
                key={s}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-ink-soft"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            Notas do time
          </h3>
          <div className="mt-2 flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Registrar impressão da entrevista..."
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink"
            />
            <button
              type="button"
              onClick={() => {
                if (!note.trim()) return;
                addNote(candidate.id, note.trim());
                setNote("");
              }}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Salvar
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {candidate.notes.map((n) => (
              <li key={n.id} className="rounded-xl bg-secondary px-3 py-2 text-sm text-ink">
                {n.text}
                <span className="ml-2 text-[11px] text-ink-soft">
                  {new Date(n.at).toLocaleString("pt-BR")}
                </span>
              </li>
            ))}
            {candidate.notes.length === 0 && (
              <li className="text-sm text-ink-soft">Nenhuma nota registrada ainda.</li>
            )}
          </ul>
        </section>

        <section className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            Histórico do processo
          </h3>
          <ol className="mt-2 space-y-2 border-l border-border pl-4">
            {candidate.timeline.map((t) => (
              <li key={t.id} className="relative text-sm text-ink">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-cyan" />
                {t.label}
                <span className="ml-2 text-[11px] text-ink-soft">
                  {t.at.includes("T") ? new Date(t.at).toLocaleString("pt-BR") : t.at}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </div>
  );
}
