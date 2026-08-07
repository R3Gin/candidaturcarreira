import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  Clock,
  MapPin,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";

const title = "Painel do candidato | Candidatu";
const description =
  "Acompanhe suas candidaturas etapa por etapa, veja faixas salariais e receba vagas recomendadas no painel do Candidatu.";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

const tabs = ["Em andamento", "Banco de talentos", "Finalizadas"] as const;

const stats = [
  { label: "Candidaturas ativas", value: "6", hint: "2 avançaram esta semana" },
  { label: "Visualizações do perfil", value: "38", hint: "+12 em 7 dias" },
  { label: "Vagas salvas", value: "11", hint: "3 fecham em breve" },
  { label: "Match médio", value: "82%", hint: "com seu currículo" },
];

const stages = ["Inscrição", "Triagem", "Entrevista", "Proposta"];

const applications = [
  {
    company: "Nuvem Log",
    rating: 4.2,
    role: "Analista Administrativo (Logística)",
    city: "Joinville · Híbrido",
    salary: "R$ 2.990 – R$ 3.400",
    stage: 2,
    updated: "Atualizada há 2 dias",
    deadline: "Retorno previsto em 5 dias",
  },
  {
    company: "Vencer Educação",
    rating: 4.6,
    role: "Executivo de Relacionamento",
    city: "São Paulo · Remoto",
    salary: "R$ 4.200 – R$ 7.400",
    stage: 3,
    updated: "Atualizada hoje",
    deadline: "Proposta em análise",
  },
  {
    company: "Novalogic",
    rating: 3.3,
    role: "Auxiliar de Instalações",
    city: "Curitiba · Presencial",
    salary: "R$ 2.050 – R$ 2.280",
    stage: 1,
    updated: "Atualizada há 6 dias",
    deadline: "Triagem em andamento",
  },
];

const recommended = [
  { role: "Coordenador de Operações", company: "Grupo TBX", salary: "R$ 6.100 – R$ 8.000", match: "91%" },
  { role: "Analista de RH Jr.", company: "Alma Saúde", salary: "R$ 3.200 – R$ 4.100", match: "86%" },
  { role: "Assistente Financeiro", company: "Pilar Capital", salary: "R$ 2.800 – R$ 3.500", match: "80%" },
];

const salaries = [
  { role: "Analista Administrativo", range: "R$ 3.100 / mês", trend: "+4,1% no ano" },
  { role: "Coordenador de Operações", range: "R$ 7.050 / mês", trend: "+6,8% no ano" },
  { role: "Analista de RH", range: "R$ 3.850 / mês", trend: "+3,2% no ano" },
];

function Painel() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Em andamento");

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-8">
        <p className="eyebrow">Painel do candidato</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
          Olá, Eduardo. Suas candidaturas estão andando.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft sm:text-base">
          Acompanhe cada etapa com prazo à vista, salário aberto e a nota de quem já trabalhou lá.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-card">
          <Search className="ml-2 h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          <input
            placeholder="Buscar por vaga ou empresa"
            className="h-11 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform active:scale-[0.96]"
          >
            Buscar
          </button>
        </div>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="surface-card rounded-2xl p-4">
              <p className="eyebrow">{s.label}</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
            </div>
          ))}
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="surface-card h-fit rounded-2xl p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Filtrar</h2>
            <Field label="Empresa" placeholder="Selecione ou digite" />
            <Field label="Estado" placeholder="Selecione ou digite" />
            <Field label="Cidade" placeholder="Selecione ou digite" />
            <div className="mt-5">
              <p className="eyebrow">Modelo de trabalho</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Remoto", "Híbrido", "Presencial"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Aplicar filtros
            </button>
            <button type="button" className="mt-2 w-full text-xs font-semibold text-accent">
              Limpar filtros
            </button>
          </aside>

          <section>
            <div className="flex gap-1 overflow-x-auto border-b border-border">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${
                    tab === t ? "text-ink" : "text-muted-foreground hover:text-ink-soft"
                  }`}
                >
                  {t}
                  {tab === t && (
                    <span className="absolute bottom-0 left-3 right-3 h-[3px] rounded-full bg-accent" />
                  )}
                </button>
              ))}
            </div>

            {tab === "Em andamento" ? (
              <div className="mt-4 space-y-3">
                {applications.map((a) => (
                  <article key={a.role} className="surface-card rounded-2xl p-5">
                    <div className="flex flex-wrap items-start gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary font-display text-sm font-bold text-ink">
                        {a.company.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
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
                      <button
                        type="button"
                        aria-label="Salvar vaga"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-secondary"
                      >
                        <Bookmark className="h-4.5 w-4.5" strokeWidth={1.75} />
                      </button>
                    </div>

                    <div className="mt-4 grid gap-1.5 sm:grid-cols-4">
                      {stages.map((s, i) => (
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
                        {a.updated} · {a.deadline}
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent"
                      >
                        Ver processo
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="surface-card mt-4 rounded-2xl p-10 text-center">
                <p className="font-display text-lg font-semibold text-ink">
                  Nada por aqui ainda
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                  Quando uma empresa te guardar no banco de talentos ou finalizar um processo, ele
                  aparece nesta aba com o motivo do resultado.
                </p>
                <button
                  type="button"
                  className="mt-5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
                >
                  Buscar oportunidades
                </button>
              </div>
            )}

            <section className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="surface-card rounded-2xl p-5">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Recomendadas para você
                </h2>
                <ul className="mt-3 divide-y divide-border">
                  {recommended.map((r) => (
                    <li key={r.role} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{r.role}</p>
                        <p className="text-xs text-ink-soft">
                          {r.company} · {r.salary}
                        </p>
                      </div>
                      <span className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-bold text-ink">
                        {r.match}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="surface-card rounded-2xl p-5">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Seu potencial de ganho
                </h2>
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
              </div>
            </section>
          </section>
        </div>
      </main>
    </AppShell>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="mt-4 block">
      <span className="eyebrow">{label}</span>
      <input
        placeholder={placeholder}
        className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:border-accent"
      />
    </label>
  );
}
