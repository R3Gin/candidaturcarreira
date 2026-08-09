/**
 * Conta do freelancer: jobs concluídos, avaliações (modelo Uber),
 * nível, ranking, diárias e valor total ganho na plataforma.
 * Persistido em localStorage e sincronizado entre abas.
 */

export type FreelaJob = {
  id: string;
  cargo: string;
  empresa: string;
  data: string; // ISO
  diarias: number;
  valor: number; // total pago (diária x diárias)
  rating: number | null; // 1..5 (null = aguardando avaliação)
  comentario?: string;
  status: "concluido" | "aguardando";
};

export type FreelaAccount = {
  nome: string;
  headline: string;
  cidade: string;
  avatar?: string;
  habilidades: string[];
  jobs: FreelaJob[];
};

const KEY = "candidatu-freela-account";
const EVENT = "candidatu-freela-account-updated";
const APP_KEY = "candidatu-app-state";

const iso = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

export const seedAccount: FreelaAccount = {
  nome: "Você",
  headline: "Freelancer de eventos e operação",
  cidade: "São Paulo · SP",
  habilidades: ["Atendimento", "Eventos", "Logística", "Bar"],
  jobs: [
    {
      id: "j1",
      cargo: "Garçom para evento corporativo",
      empresa: "Vértice Eventos",
      data: iso(3),
      diarias: 2,
      valor: 440,
      rating: 5,
      comentario: "Pontual, uniforme impecável e muito atenção com os convidados.",
      status: "concluido",
    },
    {
      id: "j2",
      cargo: "Auxiliar de estoque (inventário)",
      empresa: "Rota Norte Logística",
      data: iso(9),
      diarias: 3,
      valor: 495,
      rating: 5,
      comentario: "Contagem sem divergência. Chamaríamos de novo.",
      status: "concluido",
    },
    {
      id: "j3",
      cargo: "Promotor de vendas em loja",
      empresa: "Grupo Naveia",
      data: iso(16),
      diarias: 1,
      valor: 180,
      rating: 4,
      comentario: "Boa abordagem, faltou registrar o relatório do dia.",
      status: "concluido",
    },
    {
      id: "j4",
      cargo: "Apoio de cozinha",
      empresa: "Casa Branca Buffet",
      data: iso(24),
      diarias: 2,
      valor: 360,
      rating: 5,
      status: "concluido",
    },
    {
      id: "j5",
      cargo: "Recepcionista de congresso",
      empresa: "Expo Vetor",
      data: iso(31),
      diarias: 1,
      valor: 200,
      rating: 3,
      comentario: "Chegou 15 minutos após o combinado.",
      status: "concluido",
    },
  ],
};

export function readAccount(): FreelaAccount {
  if (typeof window === "undefined") return seedAccount;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return withProfileName(seedAccount);
    const parsed = JSON.parse(raw) as FreelaAccount;
    return { ...seedAccount, ...parsed, jobs: parsed.jobs ?? seedAccount.jobs };
  } catch {
    return seedAccount;
  }
}

function withProfileName(acc: FreelaAccount): FreelaAccount {
  try {
    const raw = window.localStorage.getItem(APP_KEY);
    if (!raw) return acc;
    const parsed = JSON.parse(raw) as { profile?: { name?: string; avatar?: string } };
    return {
      ...acc,
      nome: parsed.profile?.name || acc.nome,
      avatar: parsed.profile?.avatar || acc.avatar,
    };
  } catch {
    return acc;
  }
}

export function writeAccount(acc: FreelaAccount) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(acc));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeAccount(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function addJob(job: Omit<FreelaJob, "id">) {
  const acc = readAccount();
  writeAccount({ ...acc, jobs: [{ ...job, id: `j-${Date.now()}` }, ...acc.jobs] });
}

export function removeJob(id: string) {
  const acc = readAccount();
  writeAccount({ ...acc, jobs: acc.jobs.filter((j) => j.id !== id) });
}

export function updateAccount(patch: Partial<FreelaAccount>) {
  writeAccount({ ...readAccount(), ...patch });
}

/* ---------- Métricas, nível e ranking ---------- */

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export type Level = {
  nome: string;
  faixa: string;
  cor: string; // classes de badge
  min: number; // diárias mínimas
};

export const levels: Level[] = [
  { nome: "Bronze", faixa: "Começando", cor: "bg-secondary text-ink", min: 0 },
  { nome: "Prata", faixa: "Confiável", cor: "bg-sky text-ink", min: 5 },
  { nome: "Ouro", faixa: "Destaque", cor: "bg-mint text-ink", min: 15 },
  { nome: "Diamante", faixa: "Top da plataforma", cor: "bg-accent text-accent-foreground", min: 40 },
];

export type Metrics = {
  jobs: number;
  diarias: number;
  ganho: number;
  rating: number; // média 0..5
  avaliacoes: number;
  distribuicao: Record<1 | 2 | 3 | 4 | 5, number>;
  level: Level;
  nextLevel: Level | null;
  progresso: number; // 0..100 até o próximo nível
  score: number; // 0..100 ranking score
  posicao: number; // posição estimada
  totalFreelas: number;
  chance: "Alta" | "Média" | "Baixa";
  ultimos30: { jobs: number; ganho: number };
};

const TOTAL_FREELAS = 4820;

export function computeMetrics(acc: FreelaAccount): Metrics {
  const feitos = acc.jobs.filter((j) => j.status === "concluido");
  const diarias = feitos.reduce((s, j) => s + j.diarias, 0);
  const ganho = feitos.reduce((s, j) => s + j.valor, 0);
  const notas = feitos.map((j) => j.rating).filter((r): r is number => typeof r === "number");
  const rating = notas.length ? notas.reduce((s, n) => s + n, 0) / notas.length : 0;

  const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  notas.forEach((n) => {
    const k = Math.min(5, Math.max(1, Math.round(n))) as 1 | 2 | 3 | 4 | 5;
    distribuicao[k] += 1;
  });

  const level = [...levels].reverse().find((l) => diarias >= l.min) ?? levels[0];
  const idx = levels.findIndex((l) => l.nome === level.nome);
  const nextLevel = levels[idx + 1] ?? null;
  const progresso = nextLevel
    ? Math.min(100, Math.round(((diarias - level.min) / (nextLevel.min - level.min)) * 100))
    : 100;

  // Score de ranking: 65% avaliação, 35% volume de diárias (saturando em 50)
  const score = Math.round((rating / 5) * 65 + Math.min(diarias / 50, 1) * 35);
  const posicao = Math.max(1, Math.round(TOTAL_FREELAS * (1 - score / 100)) || 1);
  const chance: Metrics["chance"] = score >= 70 ? "Alta" : score >= 45 ? "Média" : "Baixa";

  const limite = Date.now() - 30 * 864e5;
  const recentes = feitos.filter((j) => +new Date(j.data) >= limite);

  return {
    jobs: feitos.length,
    diarias,
    ganho,
    rating,
    avaliacoes: notas.length,
    distribuicao,
    level,
    nextLevel,
    progresso,
    score,
    posicao,
    totalFreelas: TOTAL_FREELAS,
    chance,
    ultimos30: {
      jobs: recentes.length,
      ganho: recentes.reduce((s, j) => s + j.valor, 0),
    },
  };
}
