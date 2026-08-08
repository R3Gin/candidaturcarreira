import { useState } from "react";
import { GripVertical, Star } from "lucide-react";
import { CandidateDrawer } from "../CandidateDrawer";
import { brl, initials, stages, useCompanyStore, type Candidate, type Stage } from "../store";

export function Pipeline() {
  const { candidates, vacancies, moveStage, can } = useCompanyStore();
  const canMove = can("mover_candidato");
  const [vacancyId, setVacancyId] = useState("todas");
  const [showRejected, setShowRejected] = useState(false);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const list = candidates.filter(
    (c) =>
      (vacancyId === "todas" || c.vacancyId === vacancyId) && (showRejected || !c.rejected),
  );
  const current = selected ? candidates.find((c) => c.id === selected.id) ?? null : null;

  const drop = (stage: Stage) => {
    if (dragging) moveStage(dragging, stage);
    setDragging(null);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Pipeline de seleção</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            Arraste as pessoas entre as etapas
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            {list.length} pessoas no quadro. Clique em um cartão para abrir o perfil completo,
            avaliar com scorecard, agendar entrevista ou enviar feedback.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={vacancyId}
            onChange={(e) => setVacancyId(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-ink"
          >
            <option value="todas">Todas as vagas</option>
            {vacancies.map((v) => (
              <option key={v.id} value={v.id}>
                {v.role}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-ink-soft">
            <input
              type="checkbox"
              checked={showRejected}
              onChange={(e) => setShowRejected(e.target.checked)}
            />
            Mostrar reprovados
          </label>
        </div>
      </header>

      <div className="-mx-4 overflow-x-auto px-4 pb-2">
        <div className="flex min-w-max gap-4">
          {stages.map((stage) => {
            const column = list.filter((c) => c.stage === stage);
            return (
              <section
                key={stage}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => drop(stage)}
                className="w-72 shrink-0 rounded-2xl border border-border bg-secondary/60 p-3"
              >
                <div className="flex items-center justify-between px-1">
                  <h2 className="font-display text-sm font-bold text-ink">{stage}</h2>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs font-bold text-ink-soft">
                    {column.length}
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  {column.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        draggable
                        onDragStart={() => setDragging(c.id)}
                        onClick={() => setSelected(c)}
                        className={`w-full rounded-xl border border-border bg-card p-3 text-left shadow-card transition-transform hover:-translate-y-0.5 ${
                          c.rejected ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${c.avatarTone} text-[11px] font-bold text-primary-foreground`}
                          >
                            {initials(c.name)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-ink">{c.name}</p>
                            <p className="truncate text-[11px] text-ink-soft">{c.headline}</p>
                          </div>
                          <GripVertical className="h-4 w-4 shrink-0 text-ink-soft" />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="rounded-full bg-mint px-2 py-0.5 font-bold text-ink">
                            {c.score}% match
                          </span>
                          <span className="text-ink-soft">{brl(c.salaryExpectation)}</span>
                        </div>
                        <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-soft">
                          {c.favorite && <Star className="h-3 w-3 fill-accent text-accent" />}
                          {vacancies.find((v) => v.id === c.vacancyId)?.role ?? "Vaga removida"}
                        </p>
                      </button>
                    </li>
                  ))}
                  {column.length === 0 && (
                    <li className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-ink-soft">
                      Solte um cartão aqui
                    </li>
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      {current && <CandidateDrawer candidate={current} onClose={() => setSelected(null)} />}
    </div>
  );
}
