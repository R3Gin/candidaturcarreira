import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Award,
  Briefcase,
  CalendarDays,
  MessageCircle,
  Star,
  Trash2,
  TrendingUp,
  Trash,
  Wallet,
} from "lucide-react";
import {
  addJob,
  brl,
  computeMetrics,
  levels,
  removeJob,
  type FreelaAccount,
} from "@/lib/freelaAccount";
import { removeFreelaContact, type FreelaContact } from "@/lib/freelaContacts";

export function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(2)} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${i <= Math.round(value) ? "fill-accent text-accent" : "text-border"}`}
          strokeWidth={1.75}
        />
      ))}
    </span>
  );
}

export function StatsRow({ acc }: { acc: FreelaAccount }) {
  const m = computeMetrics(acc);
  const stats = [
    { label: "Jobs concluídos", value: String(m.jobs), icon: Briefcase },
    { label: "Diárias feitas", value: String(m.diarias), icon: CalendarDays },
    { label: "Ganho na plataforma", value: brl(m.ganho), icon: Wallet },
    { label: "Últimos 30 dias", value: brl(m.ultimos30.ganho), icon: TrendingUp },
  ];
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <li key={s.label} className="surface-card rounded-2xl p-4">
          <s.icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
          <p className="mt-3 font-display text-xl font-bold text-ink">{s.value}</p>
          <p className="mt-0.5 text-xs font-semibold text-ink-soft">{s.label}</p>
        </li>
      ))}
    </ul>
  );
}

export function JobsPanel({ acc }: { acc: FreelaAccount }) {
  const m = computeMetrics(acc);
  return (
    <section className="surface-card rounded-2xl p-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow">Histórico</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">Trabalhos já feitos</h2>
        </div>
        <span className="text-xs font-semibold text-ink-soft">
          {m.diarias} diárias · {brl(m.ganho)}
        </span>
      </header>

      <ul className="mt-4 space-y-3">
        {acc.jobs.map((j) => (
          <li key={j.id} className="rounded-xl bg-secondary p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug text-ink">{j.cargo}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {j.empresa} · {new Date(j.data).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Remover job ${j.cargo}`}
                onClick={() => removeJob(j.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-ink">
              <span>
                {j.diarias} {j.diarias === 1 ? "diária" : "diárias"}
              </span>
              <span>{brl(j.valor)}</span>
              {typeof j.rating === "number" ? (
                <span className="inline-flex items-center gap-1.5">
                  <Stars value={j.rating} size="h-3.5 w-3.5" />
                  {j.rating.toFixed(1)}
                </span>
              ) : (
                <span className="rounded-full bg-background px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-ink-soft">
                  Aguardando avaliação
                </span>
              )}
            </div>
            {j.comentario && (
              <p className="mt-2 border-l-2 border-accent pl-3 text-xs italic leading-relaxed text-ink-soft">
                “{j.comentario}”
              </p>
            )}
          </li>
        ))}
      </ul>

      {acc.jobs.length === 0 && (
        <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-soft">
          Nenhum job registrado ainda. Aceite um freela para começar seu histórico.
        </p>
      )}
    </section>
  );
}

export function AvaliacoesPanel({ acc }: { acc: FreelaAccount }) {
  const m = computeMetrics(acc);
  return (
    <section className="surface-card rounded-2xl p-5">
      <p className="eyebrow">Avaliação</p>
      <h2 className="mt-1 font-display text-lg font-semibold text-ink">
        Como as empresas te avaliam
      </h2>
      <div className="mt-4 flex items-center gap-3">
        <p className="font-display text-4xl font-bold text-ink">{m.rating.toFixed(2)}</p>
        <div>
          <Stars value={m.rating} />
          <p className="mt-1 text-xs text-ink-soft">{m.avaliacoes} avaliações recebidas</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {([5, 4, 3, 2, 1] as const).map((n) => {
          const qtd = m.distribuicao[n];
          const pct = m.avaliacoes ? Math.round((qtd / m.avaliacoes) * 100) : 0;
          return (
            <li key={n} className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
              <span className="w-8">{n}★</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </span>
              <span className="w-8 text-right">{qtd}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 rounded-xl bg-secondary p-3 text-xs leading-relaxed text-ink-soft">
        Média das últimas avaliações, como no app de corridas: notas de 1 a 5 dadas pela empresa no
        fim de cada diária. Abaixo de 4,0 sua conta entra em revisão.
      </p>
    </section>
  );
}

export function RankingPanel({ acc }: { acc: FreelaAccount }) {
  const m = computeMetrics(acc);
  return (
    <section className="surface-card rounded-2xl p-5">
      <p className="eyebrow">Ranking</p>
      <h2 className="mt-1 font-display text-lg font-semibold text-ink">
        #{m.posicao} de {m.totalFreelas.toLocaleString("pt-BR")}
      </h2>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
          <span>Score de ranking</span>
          <span>{m.score}/100</span>
        </div>
        <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-secondary">
          <span className="block h-full rounded-full bg-brand" style={{ width: `${m.score}%` }} />
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-soft">
        Chance de ser contratado:{" "}
        <strong className={m.chance === "Baixa" ? "text-destructive" : "text-ink"}>
          {m.chance}
        </strong>
        . Quanto maior o ranking, mais alto você aparece na lista de candidatos das empresas.
      </p>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
          <span>
            Nível {m.level.nome}
            {m.nextLevel ? ` → ${m.nextLevel.nome}` : " · máximo"}
          </span>
          <span>{m.progresso}%</span>
        </div>
        <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-secondary">
          <span className="block h-full rounded-full bg-accent" style={{ width: `${m.progresso}%` }} />
        </span>
        {m.nextLevel && (
          <p className="mt-2 text-xs text-ink-soft">
            Faltam {Math.max(0, m.nextLevel.min - m.diarias)} diárias para o nível {m.nextLevel.nome}.
          </p>
        )}
      </div>

      <ul className="mt-4 space-y-2">
        {levels.map((l) => (
          <li
            key={l.nome}
            className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold ${
              l.nome === m.level.nome ? "bg-secondary text-ink" : "text-ink-soft"
            }`}
          >
            <Award className="h-4 w-4 text-accent" strokeWidth={1.75} />
            <span className="flex-1">
              {l.nome} · {l.faixa}
            </span>
            <span>{l.min}+ diárias</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GanhosPanel({ acc }: { acc: FreelaAccount }) {
  const m = computeMetrics(acc);
  const media = m.diarias ? Math.round(m.ganho / m.diarias) : 0;
  return (
    <section className="surface-card rounded-2xl p-5">
      <p className="eyebrow">Diárias e ganhos</p>
      <h2 className="mt-1 font-display text-lg font-semibold text-ink">
        {brl(m.ganho)} em {m.diarias} diárias
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        <li className="rounded-xl bg-secondary p-4">
          <p className="text-xs font-semibold text-ink-soft">Média por diária</p>
          <p className="mt-1 font-display text-xl font-bold text-ink">{brl(media)}</p>
        </li>
        <li className="rounded-xl bg-secondary p-4">
          <p className="text-xs font-semibold text-ink-soft">Últimos 30 dias</p>
          <p className="mt-1 font-display text-xl font-bold text-ink">{brl(m.ultimos30.ganho)}</p>
        </li>
        <li className="rounded-xl bg-secondary p-4">
          <p className="text-xs font-semibold text-ink-soft">Jobs em 30 dias</p>
          <p className="mt-1 font-display text-xl font-bold text-ink">{m.ultimos30.jobs}</p>
        </li>
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-ink-soft">
        Valores somados das diárias já pagas pelas empresas dentro da Candidatu.
      </p>
    </section>
  );
}

export function ContatosPanel({ contatos }: { contatos: FreelaContact[] }) {
  return (
    <section className="surface-card rounded-2xl p-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow">Contatos e chats</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">
            {contatos.length}{" "}
            {contatos.length === 1 ? "solicitação enviada" : "solicitações enviadas"}
          </h2>
        </div>
        <Link to="/painel" className="text-xs font-semibold text-brand hover:underline">
          Abrir chats no painel
        </Link>
      </header>
      {contatos.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-soft">
          Nenhuma solicitação enviada ainda. Use o botão “Contato” em um freela para falar com a
          empresa.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {contatos.map((c) => (
            <li key={c.id} className="rounded-xl bg-secondary p-3">
              <div className="flex items-start gap-2">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-ink">
                  <Link to="/freelance/$id" params={{ id: c.freelaId }} className="hover:underline">
                    {c.cargo}
                  </Link>{" "}
                  · {c.empresa}
                </p>
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                Enviada em {new Date(c.at).toLocaleString("pt-BR")} · resposta em {c.contato}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-mint px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-ink">
                  Chat aberto
                </span>
                <button
                  type="button"
                  aria-label={`Remover solicitação de ${c.cargo}`}
                  onClick={() => removeFreelaContact(c.id)}
                  className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function NovoJobForm() {
  const [cargo, setCargo] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [diarias, setDiarias] = useState(1);
  const [valor, setValor] = useState(200);
  const [rating, setRating] = useState(5);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargo.trim() || !empresa.trim()) return;
    addJob({
      cargo: cargo.trim(),
      empresa: empresa.trim(),
      data: new Date().toISOString(),
      diarias,
      valor,
      rating,
      status: "concluido",
    });
    setCargo("");
    setEmpresa("");
  };

  const field =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink outline-none";
  const label = "mb-1 block text-xs font-bold uppercase tracking-wide text-ink-soft";

  return (
    <form onSubmit={submit} className="surface-card rounded-2xl p-5">
      <p className="eyebrow">Registrar</p>
      <h2 className="mt-1 font-display text-lg font-semibold text-ink">Adicionar job concluído</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={label}>Cargo / função</span>
          <input
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            className={field}
            placeholder="Barman para casamento"
          />
        </label>
        <label className="block">
          <span className={label}>Empresa</span>
          <input
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            className={field}
            placeholder="Vértice Eventos"
          />
        </label>
        <label className="block">
          <span className={label}>Diárias</span>
          <input
            type="number"
            min={1}
            value={diarias}
            onChange={(e) => setDiarias(Math.max(1, Number(e.target.value)))}
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>Valor recebido (R$)</span>
          <input
            type="number"
            min={0}
            step={10}
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>Avaliação da empresa</span>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className={field}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} estrela{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Salvar no histórico
      </button>
    </form>
  );
}
