import { useMemo, useState } from "react";
import { BadgeCheck, Bookmark, Building2, Heart, MapPin, Search, Star, TrendingUp } from "lucide-react";
import { applications, jobPool, useAppStore } from "../store";
import { Chip, PageHead } from "./ui";

const stats = [
  { label: "Candidaturas ativas", value: String(applications.filter((a) => a.stage < 4).length), hint: "2 avançaram esta semana" },
  { label: "Visualizações do perfil", value: "38", hint: "+12 em 7 dias" },
  { label: "Match médio", value: "82%", hint: "com seu currículo" },
];

const salaries = [
  { role: "Analista Administrativo", range: "R$ 3.100 / mês", trend: "+4,1% no ano" },
  { role: "Coordenador de Operações", range: "R$ 7.050 / mês", trend: "+6,8% no ano" },
  { role: "Analista de RH", range: "R$ 3.850 / mês", trend: "+3,2% no ano" },
];

const models = ["Remoto", "Híbrido", "Presencial"];

export function CentralVagas() {
  const { savedJobs, toggleSaved, followed, toggleFollow } = useAppStore();
  const [query, setQuery] = useState("");
  const [model, setModel] = useState<string | null>(null);

  const list = useMemo(
    () =>
      jobPool.filter((j) => {
        const q = query.trim().toLowerCase();
        const qOk = !q || j.role.toLowerCase().includes(q) || j.company.toLowerCase().includes(q);
        const mOk = !model || j.city.toLowerCase().includes(model.toLowerCase());
        return qOk && mOk;
      }),
    [query, model],
  );

  return (
    <div className="space-y-6">
      <PageHead
        eyebrow="Central de empregabilidade"
        title="Busque vagas e empresas em um só lugar"
        subtitle="Salve vagas com o marcador, siga empresas com o coração e acompanhe faixas salariais reais."
      />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-card">
        <Search className="ml-2 h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por vaga ou empresa"
          className="h-11 min-w-40 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
        />
        <div className="flex flex-wrap gap-2 pr-1">
          {models.map((m) => (
            <Chip key={m} label={m} active={model === m} onClick={() => setModel(model === m ? null : m)} />
          ))}
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink">
          {list.length} {list.length === 1 ? "vaga encontrada" : "vagas encontradas"}
        </h2>
        {list.map((j) => {
          const saved = savedJobs.includes(j.id);
          const company = {
            id: `co-${j.company}`,
            name: j.company,
            segment: "Empresa parceira Candidatu",
            rating: j.rating,
            reason: "Você demonstrou interesse nesta empresa",
            since: "agora",
          };
          const following = followed.some((c) => c.id === company.id);
          return (
            <article key={j.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary font-display text-sm font-bold text-ink">
                  {j.company.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
                    <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {j.company}
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      {j.rating.toFixed(1)}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-lg font-semibold text-ink">{j.role}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {j.city}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-ink">
                      <BadgeCheck className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                      {j.salary}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {j.tags.map((t) => (
                      <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="mr-1 rounded-full bg-mint px-2 py-0.5 text-[11px] font-bold text-ink">
                    {j.match}
                  </span>
                  <button
                    type="button"
                    aria-label={following ? `Deixar de seguir ${j.company}` : `Seguir ${j.company}`}
                    onClick={() => toggleFollow(company)}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary ${
                      following ? "text-accent" : "text-ink-soft"
                    }`}
                  >
                    <Heart className={`h-4.5 w-4.5 ${following ? "fill-accent" : ""}`} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    aria-label={saved ? `Remover ${j.role} das vagas salvas` : `Salvar ${j.role}`}
                    onClick={() => toggleSaved(j.id)}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary ${
                      saved ? "text-accent" : "text-ink-soft"
                    }`}
                  >
                    <Bookmark className={`h-4.5 w-4.5 ${saved ? "fill-accent" : ""}`} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold text-ink">Seu potencial de ganho</h2>
        <ul className="mt-3 divide-y divide-border">
          {salaries.map((s) => (
            <li key={s.role} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{s.role}</p>
                <p className="text-xs text-ink-soft">{s.range}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent">
                <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
                {s.trend}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
