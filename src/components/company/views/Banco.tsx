import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { CandidateDrawer } from "../CandidateDrawer";
import { brl, initials, stages, useCompanyStore, type Candidate } from "../store";

export function Banco() {
  const { candidates, vacancies } = useCompanyStore();
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("todas");
  const [model, setModel] = useState("todos");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [selected, setSelected] = useState<Candidate | null>(null);

  const list = useMemo(
    () =>
      candidates
        .filter((c) => {
          const text = `${c.name} ${c.headline} ${c.skills.join(" ")} ${c.city}`.toLowerCase();
          if (q && !text.includes(q.toLowerCase())) return false;
          if (stage !== "todas" && c.stage !== stage) return false;
          if (model !== "todos" && c.model !== model) return false;
          if (onlyFavorites && !c.favorite) return false;
          if (c.score < minScore) return false;
          return true;
        })
        .sort((a, b) => b.score - a.score),
    [candidates, q, stage, model, onlyFavorites, minScore],
  );
  const current = selected ? candidates.find((c) => c.id === selected.id) ?? null : null;

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Banco de talentos</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          {list.length} pessoas encontradas
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Busque por competência, cidade ou senioridade e convide talentos para novos processos.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="React, People Analytics, São Paulo..."
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:border-brand-cyan"
            />
          </div>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold text-ink"
          >
            <option value="todas">Todas as etapas</option>
            {stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold text-ink"
          >
            <option value="todos">Qualquer modelo</option>
            {["Remoto", "Híbrido", "Presencial"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-ink-soft">
            <input
              type="checkbox"
              checked={onlyFavorites}
              onChange={(e) => setOnlyFavorites(e.target.checked)}
            />
            Só favoritos
          </label>
          <label className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-ink-soft">
            Match mín. {minScore}%
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelected(c)}
            className="rounded-2xl border border-border bg-card p-4 text-left shadow-card transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${c.avatarTone} text-xs font-bold text-primary-foreground`}
              >
                {initials(c.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-semibold text-ink">{c.name}</p>
                <p className="truncate text-xs text-ink-soft">{c.headline}</p>
              </div>
              {c.favorite && <Star className="ml-auto h-4 w-4 fill-accent text-accent" />}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.skills.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-ink-soft"
                >
                  {s}
                </span>
              ))}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-ink-soft">
              <div>
                <dt>Match</dt>
                <dd className="font-bold text-ink">{c.score}%</dd>
              </div>
              <div>
                <dt>Pretensão</dt>
                <dd className="font-bold text-ink">{brl(c.salaryExpectation)}</dd>
              </div>
              <div>
                <dt>Etapa</dt>
                <dd className="font-bold text-ink">{c.rejected ? "Reprovado" : c.stage}</dd>
              </div>
              <div>
                <dt>Vaga</dt>
                <dd className="truncate font-bold text-ink">
                  {vacancies.find((v) => v.id === c.vacancyId)?.role ?? "—"}
                </dd>
              </div>
            </dl>
          </button>
        ))}
        {list.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-ink-soft md:col-span-2 xl:col-span-3">
            Nenhum talento com esses filtros. Reduza o match mínimo ou limpe a busca.
          </p>
        )}
      </div>

      {current && <CandidateDrawer candidate={current} onClose={() => setSelected(null)} />}
    </div>
  );
}
