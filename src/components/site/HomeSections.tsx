import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BadgeCheck,
  Bot,
  CalendarClock,
  CheckCircle2,
  FileText,
  KanbanSquare,
  MessageSquareText,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { Reveal } from "./Reveal";

/* ------------------------------------------------------------------ */
/* utilidades                                                          */
/* ------------------------------------------------------------------ */

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

function CountUp({
  to,
  duration = 1400,
  suffix = "",
  prefix = "",
}: {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Marquee de empresas                                             */
/* ------------------------------------------------------------------ */

const marcas = [
  "Movva",
  "Cooperflora",
  "Tramo Labs",
  "Rota Norte",
  "Grupo Aurora",
  "Vertize",
  "Casa Nove",
  "Solaris Energia",
  "Bem Saúde",
  "Nordeste Log",
];

export function EmpresasMarquee() {
  return (
    <section aria-label="Empresas que contratam pelo Candidatu" className="border-y border-border bg-secondary/60 py-10">
      <p className="eyebrow mx-auto max-w-6xl px-5 text-center">
        +1.800 empresas contratam pelo Candidatu
      </p>
      <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-3">
          {[...marcas, ...marcas].map((m, i) => (
            <span
              key={`${m}-${i}`}
              className="surface-card flex h-14 items-center whitespace-nowrap rounded-xl px-6 font-display text-sm font-bold text-ink-soft"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Números — cards interativos com anel animado                    */
/* ------------------------------------------------------------------ */

const numeros = [
  {
    valor: 62,
    suffix: "%",
    progresso: 62,
    icon: Zap,
    titulo: "menos tempo para fechar uma vaga",
    detalhe: "De 41 para 16 dias em média nas empresas que usam a triagem por IA.",
  },
  {
    valor: 3,
    suffix: "x",
    progresso: 75,
    icon: FileText,
    titulo: "mais candidaturas concluídas",
    detalhe: "O currículo gerado por IA elimina o abandono no meio do formulário.",
  },
  {
    valor: 94,
    suffix: "%",
    progresso: 94,
    icon: MessageSquareText,
    titulo: "dos candidatos recebem retorno",
    detalhe: "Prazo combinado na publicação e aviso automático em cada etapa.",
  },
  {
    valor: 12,
    suffix: " mil",
    progresso: 88,
    icon: BarChart3,
    titulo: "vagas e freelas por mês",
    detalhe: "Contratações CLT, PJ e diárias de freela publicadas na plataforma.",
  },
];

function StatRing({ progresso, children }: { progresso: number; children: ReactNode }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const r = 34;
  const c = 2 * Math.PI * r;

  return (
    <div ref={ref} className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="5"
          className="stroke-primary-foreground/15"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className="stroke-brand-cyan"
          style={{
            strokeDasharray: c,
            strokeDashoffset: inView ? c - (c * progresso) / 100 : c,
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.2, 0, 0, 1)",
          }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </div>
  );
}

export function Numeros() {
  return (
    <section
      id="resultados"
      className="brand-gradient relative overflow-hidden text-primary-foreground"
    >
      <span className="animate-float pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-cyan/20 blur-3xl" />
      <span
        className="animate-float pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-primary-foreground/10 blur-3xl"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.16em]">
              <Sparkles className="h-3.5 w-3.5 text-brand-cyan" strokeWidth={2} />
              Resultados reais
            </span>
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
              Um processo <span className="shimmer-text">inteligente de ponta a ponta</span>, para
              quem contrata e para quem se candidata
            </h2>
          </div>
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-xs font-semibold text-primary-foreground/80">
            <i className="animate-blink h-2 w-2 rounded-full bg-brand-cyan" />
            dados atualizados em tempo real
          </p>
        </div>

        <dl className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {numeros.map((n, i) => {
            const Icon = n.icon;
            return (
              <Reveal
                key={n.titulo}
                delay={i * 120}
                className="group relative overflow-hidden rounded-3xl border border-primary-foreground/15 bg-primary-foreground/[0.07] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-cyan/50 hover:bg-primary-foreground/[0.12]"
              >
                <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-cyan/0 blur-2xl transition-colors duration-500 group-hover:bg-brand-cyan/30" />

                <div className="relative flex items-center gap-4">
                  <StatRing progresso={n.progresso}>
                    <dt className="font-display text-xl font-bold text-brand-cyan">
                      <CountUp to={n.valor} suffix={n.suffix} />
                    </dt>
                  </StatRing>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5 text-brand-cyan" strokeWidth={1.75} />
                  </span>
                </div>

                <dd className="relative mt-5">
                  <p className="font-display text-base font-semibold leading-snug">{n.titulo}</p>
                  <p className="mt-2 text-xs leading-relaxed text-primary-foreground/60">
                    {n.detalhe}
                  </p>
                </dd>
              </Reveal>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Showcase com abas + "gifs" animados                             */
/* ------------------------------------------------------------------ */

type Feature = {
  key: string;
  aba: string;
  icon: typeof Bot;
  titulo: string;
  texto: string;
  bullets: string[];
  visual: ReactNode;
};

function ChatVisual() {
  return (
    <div className="rounded-2xl bg-secondary p-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="animate-pulse-ring flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <MessageSquareText className="h-4 w-4" strokeWidth={2} />
        </span>
        <p className="text-sm font-semibold text-ink">Candidatu · triagem automática</p>
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <p className="animate-fade-up max-w-[85%] rounded-2xl rounded-tl-sm bg-card px-3 py-2 text-ink shadow-card">
          Olá! Você tem experiência com atendimento N2?
        </p>
        <p
          className="animate-fade-up ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-primary-foreground"
          style={{ animationDelay: "0.5s" }}
        >
          Sim, 3 anos em suporte de software.
        </p>
        <p
          className="animate-fade-up max-w-[85%] rounded-2xl rounded-tl-sm bg-card px-3 py-2 text-ink shadow-card"
          style={{ animationDelay: "1s" }}
        >
          Perfeito. Score gerado: <strong className="text-accent">92/100</strong>
        </p>
        <span className="inline-flex items-center gap-1 pl-1">
          <i className="animate-blink h-1.5 w-1.5 rounded-full bg-ink-soft" />
          <i className="animate-blink h-1.5 w-1.5 rounded-full bg-ink-soft" style={{ animationDelay: "0.2s" }} />
          <i className="animate-blink h-1.5 w-1.5 rounded-full bg-ink-soft" style={{ animationDelay: "0.4s" }} />
        </span>
      </div>
    </div>
  );
}

function RankingVisual() {
  const cvs = [
    { nome: "Ana Ribeiro", score: 96 },
    { nome: "Caio Duarte", score: 88 },
    { nome: "Marina Alves", score: 74 },
    { nome: "João Prado", score: 61 },
  ];
  return (
    <div className="rounded-2xl bg-secondary p-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <p className="text-sm font-semibold text-ink">Ordenação por IA</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-ink">
          <Sparkles className="h-3 w-3" strokeWidth={2} /> ao vivo
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {cvs.map((c, i) => (
          <li key={c.nome}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-ink">{c.nome}</span>
              <span className="font-display font-bold text-accent">{c.score}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-card">
              <span
                className="animate-bar-fill block h-full rounded-full bg-brand-cyan"
                style={{ width: `${c.score}%`, animationDelay: `${i * 160}ms` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function KanbanVisual() {
  const cards = [
    { nome: "Ana Ribeiro", etapa: "Entrevista" },
    { nome: "Caio Duarte", etapa: "Teste técnico" },
    { nome: "Marina Alves", etapa: "Proposta" },
  ];
  return (
    <div className="rounded-2xl bg-secondary p-4">
      <p className="border-b border-border pb-3 text-sm font-semibold text-ink">
        Pipeline de contratação
      </p>
      <div className="mt-4 h-[188px] overflow-hidden">
        <div className="animate-slide-cards space-y-3">
          {[...cards, ...cards].map((c, i) => (
            <div
              key={`${c.nome}-${i}`}
              className="surface-card flex items-center gap-3 rounded-xl p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-xs font-bold text-primary">
                {c.nome
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{c.nome}</p>
                <p className="text-xs text-muted-foreground">movido para {c.etapa}</p>
              </div>
              <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardVisual() {
  const barras = [42, 68, 55, 88, 74, 96];
  return (
    <div className="rounded-2xl bg-secondary p-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <p className="text-sm font-semibold text-ink">Painel de contratações</p>
        <span className="text-xs font-semibold text-accent">+18% no mês</span>
      </div>
      <div className="mt-6 flex h-[150px] items-end gap-2.5">
        {barras.map((b, i) => (
          <span
            key={i}
            className="animate-grow flex-1 rounded-t-lg bg-primary/80"
            style={{
              height: `${b}%`,
              transformOrigin: "bottom",
              animationDelay: `${i * 120}ms`,
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex justify-between text-[0.65rem] font-semibold uppercase tracking-wider text-ink-soft">
        {["jan", "fev", "mar", "abr", "mai", "jun"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

const features: Feature[] = [
  {
    key: "candidatura",
    aba: "Candidatura sem barreiras",
    icon: Zap,
    titulo: "Candidatura em segundos, sem anexar PDF",
    texto:
      "Perfil único que substitui o currículo, formulário curto e triagem conversacional. Mais gente concluindo a inscrição, menos etapas no caminho.",
    bullets: [
      "Candidatura rápida em dois toques",
      "Pré-entrevista automática com score objetivo",
      "Currículo gerado por IA a partir de um formulário simples",
    ],
    visual: <ChatVisual />,
  },
  {
    key: "ia",
    aba: "Triagem com IA",
    icon: Bot,
    titulo: "A IA ordena os currículos e explica o porquê",
    texto:
      "Você escolhe os critérios e os pesos que importam na vaga. O Candidatu ordena, justifica cada posição e deixa a decisão nas suas mãos.",
    bullets: [
      "Critérios e pesos definidos por você",
      "Explicação transparente de cada score",
      "Banco de talentos com busca inteligente",
    ],
    visual: <RankingVisual />,
  },
  {
    key: "processo",
    aba: "Processo estruturado",
    icon: KanbanSquare,
    titulo: "Kanban, etapas e reuniões no mesmo lugar",
    texto:
      "Arraste candidatos entre etapas, agende entrevistas e dispare mensagens automáticas personalizadas em cada avanço.",
    bullets: [
      "Lista ou kanban, do jeito que o time trabalha",
      "Modelos de chat e e-mail com variáveis",
      "Agenda de reuniões com confirmação do candidato",
    ],
    visual: <KanbanVisual />,
  },
  {
    key: "dados",
    aba: "Decisões com dados",
    icon: BarChart3,
    titulo: "Indicadores em tempo real para provar resultado",
    texto:
      "Tempo de fechamento, funil por etapa, origem das candidaturas e diversidade das contratações — tudo atualizado enquanto o processo acontece.",
    bullets: [
      "Painéis nativos e personalizados",
      "Funil por etapa e por recrutador",
      "Exportação dos relatórios quando quiser",
    ],
    visual: <DashboardVisual />,
  },
];

export function Showcase() {
  const [ativo, setAtivo] = useState(features[0]!.key);
  const atual = features.find((f) => f.key === ativo) ?? features[0]!;

  return (
    <section id="plataforma" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <p className="eyebrow">A plataforma</p>
      <h2 className="mt-2 max-w-2xl text-3xl font-semibold md:text-4xl">
        Tudo o que o seu recrutamento precisa, em um fluxo só
      </h2>

      <div
        role="tablist"
        aria-label="Recursos da plataforma"
        className="mt-8 flex flex-wrap gap-2"
      >
        {features.map((f) => {
          const Icon = f.icon;
          const on = f.key === ativo;
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setAtivo(f.key)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                on
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "border border-border text-ink-soft hover:bg-secondary"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {f.aba}
            </button>
          );
        })}
      </div>

      <div className="surface-card mt-6 grid gap-8 rounded-3xl p-6 md:grid-cols-2 md:p-10">
        <div key={`${atual.key}-txt`} className="animate-fade-up">
          <h3 className="text-2xl font-semibold md:text-3xl">{atual.titulo}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{atual.texto}</p>
          <ul className="mt-6 space-y-3">
            {atual.bullets.map((b) => (
              <li key={b} className="flex gap-2.5 text-sm text-ink">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                {b}
              </li>
            ))}
          </ul>
          <Link
            to="/empresa"
            className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.96]"
          >
            Ver demonstração
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
        <div key={`${atual.key}-vis`} className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {atual.visual}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Jornada                                                          */
/* ------------------------------------------------------------------ */

const jornada = [
  {
    icon: FileText,
    titulo: "Monte o perfil em minutos",
    texto: "A IA transforma suas respostas em um currículo pronto para baixar em PDF.",
  },
  {
    icon: Sparkles,
    titulo: "Receba vagas que combinam",
    texto: "Salário, região, modelo de trabalho e benefícios entram no cálculo do match.",
  },
  {
    icon: MessageSquareText,
    titulo: "Converse direto com a empresa",
    texto: "Chat aberto ao ser aprovado, com aviso automático de cada avanço de etapa.",
  },
  {
    icon: CalendarClock,
    titulo: "Confirme a entrevista",
    texto: "Convites de reunião com data, link e confirmação em um clique.",
  },
];

export function Jornada() {
  return (
    <section id="jornada" className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <p className="eyebrow">Para quem se candidata</p>
        <h2 className="mt-2 max-w-xl text-3xl font-semibold md:text-4xl">
          Da inscrição à proposta, sem sumiço no meio do caminho
        </h2>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {jornada.map((j, i) => {
            const Icon = j.icon;
            return (
              <Reveal
                as="li"
                key={j.titulo}
                delay={i * 110}
                className="surface-card rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <p className="mt-4 font-display text-sm font-bold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{j.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{j.texto}</p>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Depoimentos                                                      */
/* ------------------------------------------------------------------ */

const depoimentos = [
  {
    texto:
      "Reduzimos o tempo de fechamento de vaga de 41 para 16 dias. A ordenação por IA mudou a rotina da triagem.",
    nome: "Renata Coelho",
    cargo: "Coordenadora de RH · Movva",
    nota: 5,
  },
  {
    texto:
      "Publicamos freelas com diária aberta e recebemos gente qualificada no mesmo dia. O chat evitou dezenas de e-mails.",
    nome: "Diego Sampaio",
    cargo: "Head de Operações · Rota Norte",
    nota: 5,
  },
  {
    texto:
      "Fiz o currículo pela IA em 4 minutos e fui chamada em duas vagas na semana seguinte. Acompanhar as etapas dá paz.",
    nome: "Aline Farias",
    cargo: "Analista de Suporte",
    nota: 5,
  },
];

export function Depoimentos() {
  return (
    <section id="depoimentos" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <p className="eyebrow">Quem já usa</p>
      <h2 className="mt-2 max-w-xl text-3xl font-semibold md:text-4xl">
        RHs e candidatos contando o que mudou
      </h2>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {depoimentos.map((d, i) => (
          <Reveal
            as="article"
            key={d.nome}
            delay={i * 110}
            className="surface-card flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: d.nota }).map((_, s) => (
                <Star key={s} className="h-4 w-4 fill-accent text-accent" strokeWidth={0} />
              ))}
            </div>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-ink">“{d.texto}”</p>
            <footer className="mt-6 flex items-center gap-3 border-t border-border pt-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <Users className="h-4 w-4 text-ink-soft" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{d.nome}</p>
                <p className="truncate text-xs text-muted-foreground">{d.cargo}</p>
              </div>
            </footer>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 6. FAQ                                                              */
/* ------------------------------------------------------------------ */

const faq = [
  {
    q: "O Candidatu é gratuito para quem procura emprego?",
    a: "Sim. Criar perfil, gerar o currículo com IA, se candidatar a vagas e freelas e acompanhar as etapas é gratuito para candidatos.",
  },
  {
    q: "Como funciona a triagem com inteligência artificial?",
    a: "Você define os critérios e os pesos da vaga. A IA ordena as candidaturas com uma explicação para cada score, e a decisão final continua sendo do time de recrutamento.",
  },
  {
    q: "Consigo publicar vagas de freelance com diária?",
    a: "Sim. Ao publicar, escolha entre vaga contratual ou freelance. Freelas aparecem na página de freelas com diária, carga horária e período.",
  },
  {
    q: "Dá para personalizar as mensagens automáticas?",
    a: "Sim. Os modelos de chat e e-mail de cada etapa e de reuniões podem ser editados com variáveis como nome do candidato e título da vaga.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
        <p className="eyebrow">Perguntas frequentes</p>
        <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Ainda com dúvidas?</h2>

        <div className="mt-10 space-y-3">
          {faq.map((f) => (
            <details
              key={f.q}
              className="surface-card group rounded-2xl px-5 py-4 transition-shadow duration-300 hover:shadow-lift"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-semibold text-ink">
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-accent transition-transform duration-300 group-open:rotate-90"
                  strokeWidth={2}
                />
                {f.q}
              </summary>
              <p className="mt-3 pl-7 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 7. CTA final                                                        */
/* ------------------------------------------------------------------ */

export function CtaFinal() {
  return (
    <section id="empregadores" className="mx-auto max-w-6xl px-5 py-20 md:py-24">
      <div className="brand-gradient relative overflow-hidden rounded-3xl px-6 py-14 text-center text-primary-foreground md:px-16 md:py-20">
        <span className="animate-float pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-cyan/25 blur-2xl" />
        <span
          className="animate-float pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-primary-foreground/10 blur-2xl"
          style={{ animationDelay: "1.5s" }}
        />
        <p className="eyebrow relative text-primary-foreground/60">Comece hoje</p>
        <h2 className="relative mx-auto mt-2 max-w-2xl text-3xl font-semibold md:text-4xl">
          Contrate com transparência ou encontre a sua próxima vaga
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/75">
          Primeira vaga sem custo para empresas. Perfil, currículo por IA e acompanhamento de etapas
          sempre gratuitos para candidatos.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/empresa"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.96]"
          >
            Publicar uma vaga
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
          <Link
            to="/painel"
            className="inline-flex items-center rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
          >
            Buscar vagas
          </Link>
          <Link
            to="/freelance"
            className="inline-flex items-center rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
          >
            Ver freelas do dia
          </Link>
        </div>
      </div>
    </section>
  );
}
