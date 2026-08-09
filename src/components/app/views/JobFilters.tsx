import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";
import type { Job } from "../store";

export type SearchMode = "vagas" | "empresas";

export type JobFilterState = {
  mode: SearchMode;
  query: string;
  areas: string[];
  tags: string[];
  hiddenCompanies: string[];
  onlyWithSalary: boolean;
  onlyPromoted: boolean;
};

export const emptyFilters: JobFilterState = {
  mode: "vagas",
  query: "",
  areas: [],
  tags: [],
  hiddenCompanies: [],
  onlyWithSalary: false,
  onlyPromoted: false,
};

const areaRules: { area: string; words: string[] }[] = [
  { area: "Administrativo", words: ["administrativ", "auxiliar administrativo"] },
  { area: "Atendimento & Suporte", words: ["atendimento", "suporte", "sac", "call center"] },
  { area: "Comercial / Vendas", words: ["vendas", "comercial", "consultor", "representante"] },
  { area: "Comunicação", words: ["comunicaç", "assessoria", "imprensa"] },
  { area: "Design", words: ["design", "ux", "ui"] },
  { area: "Educação", words: ["professor", "educaç", "pedagog", "instrutor"] },
  { area: "Financeiro", words: ["financeir", "contábil", "contabil", "fiscal"] },
  { area: "Jurídico", words: ["jurídic", "juridic", "advogad"] },
  { area: "Logística", words: ["logístic", "logistic", "estoque", "expediç", "motorista"] },
  { area: "Marketing", words: ["marketing", "mídia", "midia", "growth", "social media"] },
  { area: "Operações", words: ["operaç", "coordenador de operaç", "produção", "produc"] },
  { area: "Programação", words: ["desenvolv", "program", "software", "back-end", "front-end"] },
  { area: "Recursos Humanos", words: ["rh", "recursos humanos", "recrutamento", "people"] },
  { area: "Saúde", words: ["saúde", "saude", "enfermeir", "técnico de enfermagem", "clínic"] },
  { area: "Tecnologia / TI", words: ["ti ", "tecnologia", "dados", "data", "infra", "analytics"] },
];

export const allAreas = areaRules.map((r) => r.area);

export function jobAreas(job: Job): string[] {
  const haystack = `${job.role} ${job.segment} ${job.qualifications.join(" ")}`.toLowerCase();
  const found = areaRules
    .filter((r) => r.words.some((w) => haystack.includes(w)))
    .map((r) => r.area);
  return found.length ? found : ["Outros"];
}

const extraTags = [
  "100% Remoto",
  "Vaga híbrida",
  "Candidatura simplificada",
  "Banco de Talentos",
  "Estágio",
  "Júnior",
  "Pleno",
  "Jornada reduzida",
  "PcD",
  "Vaga internacional",
  "Freelancer",
  "Renda extra",
  "PJ",
  "Inglês",
  "Bônus por indicação",
];

export function computeAllTags(jobs: Job[]) {
  return Array.from(new Set([...jobs.flatMap((j) => j.tags), ...extraTags])).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

export function computeAllCompanies(jobs: Job[]) {
  return Array.from(new Set(jobs.map((j) => j.company))).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function jobTagPool(job: Job): string[] {
  const pool = [...job.tags];
  if (job.quickApply) pool.push("Candidatura simplificada");
  if (job.city.toLowerCase().includes("remoto")) pool.push("100% Remoto");
  if (job.city.toLowerCase().includes("híbrido")) pool.push("Vaga híbrida");
  if (/jr|júnior|junior/i.test(job.role)) pool.push("Júnior");
  return pool;
}

export function filterJobs(list: Job[], f: JobFilterState) {
  const q = f.query.trim().toLowerCase();
  return list.filter((j) => {
    if (q && !`${j.role} ${j.company} ${j.city}`.toLowerCase().includes(q)) return false;
    if (f.hiddenCompanies.includes(j.company)) return false;
    if (f.areas.length && !jobAreas(j).some((a) => f.areas.includes(a))) return false;
    if (f.tags.length) {
      const pool = jobTagPool(j);
      if (!f.tags.some((t) => pool.includes(t))) return false;
    }
    if (f.onlyWithSalary && !/\d/.test(j.salary)) return false;
    if (f.onlyPromoted && !j.quickApply) return false;
    return true;
  });
}

export function countActive(f: JobFilterState) {
  return (
    f.areas.length +
    f.tags.length +
    f.hiddenCompanies.length +
    (f.onlyWithSalary ? 1 : 0) +
    (f.onlyPromoted ? 1 : 0)
  );
}

function Dropdown({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors ${
          open || count ? "border-accent text-accent" : "border-border text-ink-soft"
        }`}
      >
        {label}
        {count > 0 && (
          <span className="rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
            {count}
          </span>
        )}
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
        )}
      </button>
      {open && (
        <div className="absolute left-0 top-12 z-30 w-80 rounded-2xl border border-border bg-card p-4 shadow-card">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function ChipList({
  options,
  selected,
  onToggle,
  placeholder,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  placeholder: string;
}) {
  const [term, setTerm] = useState("");
  const shown = options.filter((o) => o.toLowerCase().includes(term.trim().toLowerCase()));
  return (
    <>
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-border bg-secondary px-3 text-sm text-ink outline-none focus:border-accent"
      />
      <div className="mt-3 flex max-h-52 flex-wrap gap-1.5 overflow-y-auto pr-1">
        {shown.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onToggle(o)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                on ? "border-accent bg-accent/10 text-accent" : "border-border text-ink-soft"
              }`}
            >
              {o}
            </button>
          );
        })}
        {shown.length === 0 && (
          <p className="py-4 text-xs text-muted-foreground">Nada encontrado.</p>
        )}
      </div>
    </>
  );
}

function DropdownFooter({ onClear, onApply, applyLabel }: {
  onClear: () => void;
  onApply: () => void;
  applyLabel: string;
}) {
  return (
    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
      <button
        type="button"
        onClick={onClear}
        className="text-xs font-semibold text-ink-soft underline"
      >
        Limpar
      </button>
      <button
        type="button"
        onClick={onApply}
        className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground"
      >
        {applyLabel}
      </button>
    </div>
  );
}

export function JobFilterBar({
  filters,
  onChange,
  resultLabel,
  jobs,
}: {
  filters: JobFilterState;
  onChange: (next: JobFilterState) => void;
  resultLabel: string;
  jobs: Job[];
}) {
  const allTags = useMemo(() => computeAllTags(jobs), [jobs]);
  const allCompanies = useMemo(() => computeAllCompanies(jobs), [jobs]);
  const set = <K extends keyof JobFilterState>(k: K, v: JobFilterState[K]) =>
    onChange({ ...filters, [k]: v });
  const toggle = (k: "areas" | "tags" | "hiddenCompanies", v: string) =>
    set(
      k,
      filters[k].includes(v) ? filters[k].filter((x) => x !== v) : [...filters[k], v],
    );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <select
            value={filters.mode}
            onChange={(e) => onChange({ ...filters, mode: e.target.value as SearchMode })}
            aria-label="Buscar por"
            className="h-11 appearance-none rounded-xl border border-border bg-secondary pl-4 pr-9 text-sm font-semibold text-ink outline-none focus:border-accent"
          >
            <option value="vagas">Vagas</option>
            <option value="empresas">Empresas</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
            strokeWidth={2}
          />
        </div>

        <div className="flex h-11 min-w-56 flex-1 items-center rounded-xl border border-border bg-card px-4">
          <input
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Insira sua busca"
            className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
          />
        </div>

        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-accent text-accent">
          <Search className="h-4.5 w-4.5" strokeWidth={2} />
        </span>

        <Dropdown label="Áreas" count={filters.areas.length}>
          {(close) => (
            <>
              <ChipList
                options={[...allAreas, "Outros"]}
                selected={filters.areas}
                onToggle={(v) => toggle("areas", v)}
                placeholder="Pesquisar áreas..."
              />
              <DropdownFooter
                onClear={() => set("areas", [])}
                onApply={close}
                applyLabel="Filtrar"
              />
            </>
          )}
        </Dropdown>

        <Dropdown label="Tags" count={filters.tags.length}>
          {(close) => (
            <>
              <ChipList
                options={allTags}
                selected={filters.tags}
                onToggle={(v) => toggle("tags", v)}
                placeholder="Pesquisar tags..."
              />
              <DropdownFooter
                onClear={() => set("tags", [])}
                onApply={close}
                applyLabel="Filtrar"
              />
            </>
          )}
        </Dropdown>

        <Dropdown label="Ocultar empresas" count={filters.hiddenCompanies.length}>
          {(close) => (
            <>
              <ChipList
                options={allCompanies}
                selected={filters.hiddenCompanies}
                onToggle={(v) => toggle("hiddenCompanies", v)}
                placeholder="Pesquisar empresas..."
              />
              <DropdownFooter
                onClear={() => set("hiddenCompanies", [])}
                onApply={close}
                applyLabel="Ocultar"
              />
            </>
          )}
        </Dropdown>

        <Dropdown
          label="Outros"
          count={(filters.onlyWithSalary ? 1 : 0) + (filters.onlyPromoted ? 1 : 0)}
        >
          {(close) => (
            <>
              <div className="space-y-3">
                <CheckRow
                  label="Somente vagas com salário disponível"
                  checked={filters.onlyWithSalary}
                  onToggle={() => set("onlyWithSalary", !filters.onlyWithSalary)}
                />
                <CheckRow
                  label="Somente vagas promovidas"
                  checked={filters.onlyPromoted}
                  onToggle={() => set("onlyPromoted", !filters.onlyPromoted)}
                />
              </div>
              <DropdownFooter
                onClear={() =>
                  onChange({ ...filters, onlyWithSalary: false, onlyPromoted: false })
                }
                onApply={close}
                applyLabel="Buscar"
              />
            </>
          )}
        </Dropdown>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold text-ink-soft">{resultLabel}</p>
        {countActive(filters) > 0 && (
          <button
            type="button"
            onClick={() => onChange({ ...emptyFilters, mode: filters.mode, query: filters.query })}
            className="text-xs font-semibold text-accent underline"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-2.5 text-left text-sm font-medium text-ink-soft"
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded border ${
          checked ? "border-accent bg-accent text-accent-foreground" : "border-border"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}
