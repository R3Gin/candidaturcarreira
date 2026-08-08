import { ArrowRight, Clock, Timer, TrendingUp, UserCheck, Users } from "lucide-react";
import { stages, useCompanyStore } from "../store";
import type { CompanyView } from "../CompanyShell";

export function Visao({ onNavigate }: { onNavigate: (v: CompanyView) => void }) {
  const { candidates, vacancies, interviews, logs, profile } = useCompanyStore();
  const inProcess = candidates.filter((c) => !c.rejected && c.stage !== "Contratado");
  const hired = candidates.filter((c) => c.stage === "Contratado");
  const open = vacancies.filter((v) => v.status === "Publicada");
  const funnel = stages.map((s) => ({
    stage: s,
    count: candidates.filter((c) => c.stage === s && !c.rejected).length,
  }));
  const max = Math.max(1, ...funnel.map((f) => f.count));

  const cards = [
    { label: "Vagas abertas", value: open.length, icon: TrendingUp, hint: `${vacancies.length} no total` },
    { label: "Pessoas no processo", value: inProcess.length, icon: Users, hint: "atualizado agora" },
    { label: "Entrevistas na semana", value: interviews.length, icon: Clock, hint: "agenda do time" },
    { label: "Contratações", value: hired.length, icon: UserCheck, hint: "últimos 30 dias" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Painel empresarial</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          Olá, {profile.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Acompanhe o funil de contratação, mova pessoas entre etapas e mantenha o feedback em dia —
          tudo com salário e etapas visíveis para quem se candidata.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{c.label}</p>
              <c.icon className="h-4.5 w-4.5 text-brand-cyan" strokeWidth={2} />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-ink">{c.value}</p>
            <p className="mt-1 text-xs text-ink-soft">{c.hint}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Funil de contratação</h2>
            <button
              type="button"
              onClick={() => onNavigate("pipeline")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand"
            >
              Abrir pipeline <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <ul className="mt-4 space-y-3">
            {funnel.map((f) => (
              <li key={f.stage}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink">{f.stage}</span>
                  <span className="text-ink-soft">{f.count}</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full brand-gradient transition-all"
                    style={{ width: `${(f.count / max) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold text-ink">Saúde do processo</h2>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-ink-soft">Tempo médio de contratação</span>
                <strong className="text-ink">18 dias</strong>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-ink-soft">Feedback enviado no prazo</span>
                <strong className="text-ink">94%</strong>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-ink-soft">Nota da empresa</span>
                <strong className="text-ink">{profile.rating.toFixed(1)}/5</strong>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-ink-soft">Recomendariam a empresa</span>
                <strong className="text-ink">{profile.recommend}%</strong>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold text-ink">Atividades recentes</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {logs.slice(0, 5).map((l) => (
                <li key={l.id} className="flex gap-2">
                  <Timer className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
                  <span className="text-ink">
                    <strong className="font-semibold">{l.title}</strong> — {l.detail}
                  </span>
                </li>
              ))}
              {logs.length === 0 && (
                <li className="text-ink-soft">
                  Nenhuma ação registrada ainda. Mova alguém no pipeline para começar.
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
