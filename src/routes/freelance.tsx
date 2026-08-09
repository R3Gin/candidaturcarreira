import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, Clock, MapPin, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Reveal } from "@/components/site/Reveal";

const title = "Freelas do dia | Candidatu";
const description =
  "Oportunidades de freelance publicadas hoje e nos últimos dias, com valor da diária, carga horária, empresa e descrição da vaga.";

export const Route = createFileRoute("/freelance")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FreelancePage,
});

type Freela = {
  id: string;
  cargo: string;
  empresa: string;
  local: string;
  diaria: string;
  carga: string;
  periodo: string;
  quando: "hoje" | "anterior";
  data: string;
  descricao: string;
  tags: string[];
};

const freelas: Freela[] = [
  {
    id: "f1",
    cargo: "Garçom para evento corporativo",
    empresa: "Vértice Eventos",
    local: "São Paulo · Presencial",
    diaria: "R$ 220",
    carga: "8h",
    periodo: "18h às 02h",
    quando: "hoje",
    data: "Hoje",
    descricao:
      "Atendimento de mesas em jantar corporativo para 180 convidados. Uniforme fornecido no local, alimentação e transporte de volta inclusos. Necessária experiência prévia em serviço à francesa.",
    tags: ["Pagamento no mesmo dia", "Alimentação inclusa"],
  },
  {
    id: "f2",
    cargo: "Auxiliar de estoque (inventário)",
    empresa: "Rota Norte Logística",
    local: "Guarulhos · Presencial",
    diaria: "R$ 165",
    carga: "6h",
    periodo: "07h às 13h",
    quando: "hoje",
    data: "Hoje",
    descricao:
      "Contagem de inventário em centro de distribuição, conferência de etiquetas e organização de pallets. Sem exigência de experiência, treinamento de 30 minutos antes do início.",
    tags: ["Sem experiência", "Vale-transporte"],
  },
  {
    id: "f3",
    cargo: "Designer para peças de campanha",
    empresa: "Tramo Labs",
    local: "Remoto · Brasil",
    diaria: "R$ 480",
    carga: "8h",
    periodo: "Horário flexível",
    quando: "hoje",
    data: "Hoje",
    descricao:
      "Adaptação de 12 peças de uma campanha já aprovada para formatos de redes sociais. Entrega em Figma, com briefing e identidade visual prontos. Revisão em uma rodada.",
    tags: ["Remoto", "Figma", "Entrega em 24h"],
  },
  {
    id: "f4",
    cargo: "Promotor(a) de vendas em supermercado",
    empresa: "Cooperflora",
    local: "Campinas · Presencial",
    diaria: "R$ 150",
    carga: "6h",
    periodo: "10h às 16h",
    quando: "hoje",
    data: "Hoje",
    descricao:
      "Degustação e abordagem de clientes em duas lojas da região central. Material de apoio entregue pela empresa. Ideal para quem tem facilidade de comunicação.",
    tags: ["Comissão extra", "Meio período"],
  },
  {
    id: "f5",
    cargo: "Fotógrafo(a) de evento esportivo",
    empresa: "Movva",
    local: "Santo André · Presencial",
    diaria: "R$ 600",
    carga: "10h",
    periodo: "06h às 16h",
    quando: "anterior",
    data: "Ontem",
    descricao:
      "Cobertura de corrida de rua com entrega de 250 fotos tratadas em até 48h. Equipamento próprio obrigatório (corpo full-frame e lente 70-200mm).",
    tags: ["Equipamento próprio", "Encerrada"],
  },
  {
    id: "f6",
    cargo: "Atendente de bilheteria",
    empresa: "Casa Lume",
    local: "Recife · Presencial",
    diaria: "R$ 140",
    carga: "5h",
    periodo: "17h às 22h",
    quando: "anterior",
    data: "Há 2 dias",
    descricao:
      "Venda e conferência de ingressos na entrada do teatro, com uso de leitor de QR Code. Escala de sexta a domingo, podendo virar freela recorrente.",
    tags: ["Pode virar recorrente", "Encerrada"],
  },
  {
    id: "f7",
    cargo: "Suporte técnico para mutirão de atendimento",
    empresa: "Movva",
    local: "Remoto · Brasil",
    diaria: "R$ 320",
    carga: "8h",
    periodo: "09h às 18h",
    quando: "anterior",
    data: "Há 3 dias",
    descricao:
      "Atendimento de fila de tickets N1 durante pico de demanda, com script e base de conhecimento prontos. Necessário computador próprio e internet estável.",
    tags: ["Remoto", "Encerrada"],
  },
];

const filtros = [
  { key: "hoje", label: "Freelas de hoje" },
  { key: "anterior", label: "Dias anteriores" },
  { key: "todos", label: "Todos" },
] as const;

function FreelancePage() {
  const [filtro, setFiltro] = useState<(typeof filtros)[number]["key"]>("hoje");

  const lista = useMemo(
    () => (filtro === "todos" ? freelas : freelas.filter((f) => f.quando === filtro)),
    [filtro],
  );

  const hoje = freelas.filter((f) => f.quando === "hoje").length;

  return (
    <main>
      <SiteHeader />

      <section className="brand-gradient text-primary-foreground">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          <p className="eyebrow text-primary-foreground/60">Freelas Candidatu</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-semibold md:text-4xl">
            Oportunidades de freelance com diária e carga horária à vista
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/70">
            {hoje} freelas abertos hoje. Cada anúncio mostra quanto paga por dia, quantas horas de
            trabalho, qual empresa está contratando e a descrição completa da vaga.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="flex flex-wrap gap-2">
          {filtros.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFiltro(f.key)}
              aria-pressed={filtro === f.key}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filtro === f.key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-ink-soft hover:bg-secondary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {lista.map((f, i) => (
            <Reveal
              as="li"
              key={f.id}
              delay={i * 80}
              className="surface-card flex flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-2">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Building2 className="h-5 w-5 text-ink-soft" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold leading-snug">{f.cargo}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{f.empresa}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {f.local}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 rounded-xl bg-secondary p-3 sm:grid-cols-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Wallet className="h-4 w-4 text-accent" strokeWidth={2} />
                  {f.diaria} / diária
                </p>
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Clock className="h-4 w-4 text-accent" strokeWidth={2} />
                  {f.carga} · {f.periodo}
                </p>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{f.descricao}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {f.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-ink-soft"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs font-semibold text-ink-soft">Publicado: {f.data}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${
                    f.quando === "hoje" ? "bg-mint text-ink" : "bg-secondary text-ink-soft"
                  }`}
                >
                  {f.quando === "hoje" ? "Aberto" : "Encerrado"}
                </span>
              </div>
            </Reveal>
          ))}
        </ul>

        {lista.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-ink-soft">
            Nenhum freela nesse período.
          </p>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
