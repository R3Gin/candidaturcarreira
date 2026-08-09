import { seedVacancies, type Vacancy } from "@/components/company/store";

export type Freela = {
  id: string;
  cargo: string;
  empresa: string;
  local: string;
  diariaValor: number;
  carga: string;
  cargaHoras: number;
  periodo: string;
  quando: "hoje" | "anterior";
  data: string;
  publishedAt: string;
  descricao: string;
  tags: string[];
  contato?: string;
  aberto: boolean;
};

export const brlDiaria = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const COMPANY_KEY = "candidatu-company";

// Ancorado à meia-noite UTC do dia para manter SSR e cliente idênticos.
const iso = (daysAgo: number) => {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
};

export const freelasBase: Freela[] = [
  {
    id: "f1",
    cargo: "Garçom para evento corporativo",
    empresa: "Vértice Eventos",
    local: "São Paulo · Presencial",
    diariaValor: 220,
    carga: "8h",
    cargaHoras: 8,
    periodo: "18h às 02h",
    quando: "hoje",
    data: "Hoje",
    publishedAt: iso(0),
    descricao:
      "Atendimento de mesas em jantar corporativo para 180 convidados. Uniforme fornecido no local, alimentação e transporte de volta inclusos. Necessária experiência prévia em serviço à francesa.",
    tags: ["Pagamento no mesmo dia", "Alimentação inclusa"],
    contato: "freelas@verticeeventos.com.br",
    aberto: true,
  },
  {
    id: "f2",
    cargo: "Auxiliar de estoque (inventário)",
    empresa: "Rota Norte Logística",
    local: "Guarulhos · Presencial",
    diariaValor: 165,
    carga: "6h",
    cargaHoras: 6,
    periodo: "07h às 13h",
    quando: "hoje",
    data: "Hoje",
    publishedAt: iso(0),
    descricao:
      "Contagem de inventário em centro de distribuição, conferência de etiquetas e organização de pallets. Sem exigência de experiência, treinamento de 30 minutos antes do início.",
    tags: ["Sem experiência", "Vale-transporte"],
    contato: "vagas@rotanorte.com.br",
    aberto: true,
  },
  {
    id: "f3",
    cargo: "Designer para peças de campanha",
    empresa: "Tramo Labs",
    local: "Remoto · Brasil",
    diariaValor: 480,
    carga: "8h",
    cargaHoras: 8,
    periodo: "Horário flexível",
    quando: "hoje",
    data: "Hoje",
    publishedAt: iso(0),
    descricao:
      "Adaptação de 12 peças de uma campanha já aprovada para formatos de redes sociais. Entrega em Figma, com briefing e identidade visual prontos. Revisão em uma rodada.",
    tags: ["Remoto", "Figma", "Entrega em 24h"],
    contato: "people@tramolabs.com",
    aberto: true,
  },
  {
    id: "f4",
    cargo: "Promotor(a) de vendas em supermercado",
    empresa: "Cooperflora",
    local: "Campinas · Presencial",
    diariaValor: 150,
    carga: "6h",
    cargaHoras: 6,
    periodo: "10h às 16h",
    quando: "hoje",
    data: "Hoje",
    publishedAt: iso(0),
    descricao:
      "Degustação e abordagem de clientes em duas lojas da região central. Material de apoio entregue pela empresa. Ideal para quem tem facilidade de comunicação.",
    tags: ["Comissão extra", "Meio período"],
    contato: "11999990000",
    aberto: true,
  },
  {
    id: "f5",
    cargo: "Fotógrafo(a) de evento esportivo",
    empresa: "Movva",
    local: "Santo André · Presencial",
    diariaValor: 600,
    carga: "10h",
    cargaHoras: 10,
    periodo: "06h às 16h",
    quando: "anterior",
    data: "Ontem",
    publishedAt: iso(1),
    descricao:
      "Cobertura de corrida de rua com entrega de 250 fotos tratadas em até 48h. Equipamento próprio obrigatório (corpo full-frame e lente 70-200mm).",
    tags: ["Equipamento próprio"],
    contato: "freelas@movva.com.br",
    aberto: false,
  },
  {
    id: "f6",
    cargo: "Atendente de bilheteria",
    empresa: "Casa Lume",
    local: "Recife · Presencial",
    diariaValor: 140,
    carga: "5h",
    cargaHoras: 5,
    periodo: "17h às 22h",
    quando: "anterior",
    data: "Há 2 dias",
    publishedAt: iso(2),
    descricao:
      "Venda e conferência de ingressos na entrada do teatro, com uso de leitor de QR Code. Escala de sexta a domingo, podendo virar freela recorrente.",
    tags: ["Pode virar recorrente"],
    contato: "contato@casalume.com.br",
    aberto: false,
  },
  {
    id: "f7",
    cargo: "Suporte técnico para mutirão de atendimento",
    empresa: "Movva",
    local: "Remoto · Brasil",
    diariaValor: 320,
    carga: "8h",
    cargaHoras: 8,
    periodo: "09h às 18h",
    quando: "anterior",
    data: "Há 3 dias",
    publishedAt: iso(3),
    descricao:
      "Atendimento de fila de tickets N1 durante pico de demanda, com script e base de conhecimento prontos. Necessário computador próprio e internet estável.",
    tags: ["Remoto"],
    contato: "suporte@movva.com.br",
    aberto: false,
  },
];

function readCompanyVacancies(): Vacancy[] {
  if (typeof window === "undefined") return seedVacancies;
  try {
    const raw = window.localStorage.getItem(COMPANY_KEY);
    if (!raw) return seedVacancies;
    const parsed = JSON.parse(raw) as { vacancies?: Vacancy[] };
    return (parsed.vacancies ?? seedVacancies).map((v) => ({
      ...v,
      type: v.type ?? "Contratual",
    }));
  } catch {
    return seedVacancies;
  }
}

export function companyVacancies(type: Vacancy["type"]): Vacancy[] {
  return readCompanyVacancies().filter((v) => v.type === type && v.status !== "Encerrada");
}

function relativeLabel(isoDate: string): { quando: Freela["quando"]; data: string } {
  const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
  if (days <= 0) return { quando: "hoje", data: "Hoje" };
  if (days === 1) return { quando: "anterior", data: "Ontem" };
  return { quando: "anterior", data: `Há ${days} dias` };
}

export function vacancyToFreela(v: Vacancy, empresa: string): Freela {
  const at = v.publishedAt ?? new Date().toISOString();
  const { quando, data } = relativeLabel(at);
  const carga = v.hours ?? "8h";
  const freela: Freela = {
    id: v.id,
    cargo: v.role,
    empresa,
    local: `${v.city} · ${v.model}`,
    diariaValor: v.dailyRate ?? v.salaryMin,
    carga,
    cargaHoras: Number(carga.replace(/\D/g, "")) || 8,
    periodo: v.period ?? "Horário flexível",
    quando,
    data,
    publishedAt: at,
    descricao: v.description || "Freela publicado pela empresa no painel Candidatu.",
    tags: [v.area, ...v.skills].slice(0, 4),
    aberto: v.status === "Publicada",
  };
  return v.contact ? { ...freela, contato: v.contact } : freela;
}

export function allFreelas(): Freela[] {
  const fromCompany = companyVacancies("Freelance").map((v) => vacancyToFreela(v, "Movva"));
  const ids = new Set(fromCompany.map((f) => f.id));
  return [...fromCompany, ...freelasBase.filter((f) => !ids.has(f.id))];
}

export function contactHref(contato: string) {
  return contato.includes("@")
    ? `mailto:${contato}`
    : `https://wa.me/55${contato.replace(/\D/g, "")}`;
}
