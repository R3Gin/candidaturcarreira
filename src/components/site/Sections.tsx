import { ArrowRight, Building2, Clock, Star } from "lucide-react";

const vagas = [
  {
    cargo: "Analista de Suporte N2",
    empresa: "Movva",
    local: "São Paulo · Híbrido",
    faixa: "R$ 4.200 – R$ 5.100",
    nota: 4.3,
    etapas: 3,
    tags: ["CLT", "Vale-refeição", "Plano de carreira"],
    novo: true,
  },
  {
    cargo: "Vendedor(a) Interno",
    empresa: "Cooperflora",
    local: "Campinas · Presencial",
    faixa: "R$ 2.400 + comissão",
    nota: 3.9,
    etapas: 2,
    tags: ["CLT", "Comissão", "Sem experiência"],
    novo: true,
  },
  {
    cargo: "Pessoa Desenvolvedora Front-end",
    empresa: "Tramo Labs",
    local: "Remoto · Brasil",
    faixa: "R$ 8.000 – R$ 11.500",
    nota: 4.7,
    etapas: 4,
    tags: ["PJ", "Remoto", "Sexta curta"],
    novo: false,
  },
  {
    cargo: "Auxiliar de Logística",
    empresa: "Rota Norte",
    local: "Recife · Presencial",
    faixa: "R$ 2.100",
    nota: 4.0,
    etapas: 2,
    tags: ["CLT", "Turno fixo", "Transporte"],
    novo: false,
  },
];

export function Vagas() {
  return (
    <section id="vagas" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Vagas abertas hoje</p>
          <h2 className="mt-2 max-w-lg text-3xl font-semibold md:text-4xl">
            Toda vaga com faixa salarial e número de etapas
          </h2>
        </div>
        <a
          href="#vagas"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
        >
          Ver 12.480 vagas
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </a>
      </div>

      <ul className="mt-10 grid gap-4 md:grid-cols-2">
        {vagas.map((vaga) => (
          <li
            key={vaga.cargo}
            className="surface-card rounded-2xl p-5 transition-shadow hover:shadow-lift"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <Building2 className="h-5 w-5 text-ink-soft" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold leading-snug">{vaga.cargo}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {vaga.empresa} · {vaga.local}
                </p>
              </div>
              {vaga.novo && (
                <span className="ml-auto shrink-0 rounded-full bg-mint px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-ink">
                  Nova
                </span>
              )}
            </div>

            <p className="mt-4 font-display text-lg font-semibold">{vaga.faixa}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {vaga.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-ink-soft"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={1.75} />
                {vaga.nota.toFixed(1)} de quem trabalha lá
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                {vaga.etapas} etapas
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const empresas = [
  { nome: "Movva", nota: 4.3, recomenda: 86, setor: "Tecnologia", vagas: 34 },
  { nome: "Cooperflora", nota: 3.9, recomenda: 71, setor: "Agro", vagas: 18 },
  { nome: "Tramo Labs", nota: 4.7, recomenda: 94, setor: "Software", vagas: 9 },
];

export function Empresas() {
  return (
    <section id="empresas" className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <p className="eyebrow text-primary-foreground/60">Termômetro Candidatu</p>
        <h2 className="mt-2 max-w-xl text-3xl font-semibold md:text-4xl">
          Quem já trabalhou lá conta como é, antes de você se candidatar
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {empresas.map((empresa) => (
            <article
              key={empresa.nome}
              className="rounded-2xl border border-primary-foreground/12 bg-primary-foreground/[0.06] p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{empresa.nome}</h3>
                <span className="flex items-center gap-1 text-sm font-semibold">
                  <Star className="h-4 w-4 fill-accent text-accent" strokeWidth={1.75} />
                  {empresa.nota.toFixed(1)}
                </span>
              </div>
              <p className="mt-1 text-sm text-primary-foreground/60">
                {empresa.setor} · {empresa.vagas} vagas abertas
              </p>

              <p className="mt-6 text-xs font-semibold text-primary-foreground/70">
                {empresa.recomenda}% recomendariam a um amigo
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-foreground/15">
                <span
                  className="block h-full rounded-full bg-accent"
                  style={{ width: `${empresa.recomenda}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const etapas = [
  {
    titulo: "Perfil que substitui o currículo",
    texto:
      "Preencha uma vez e candidate-se em dois toques. Sem anexar PDF, sem repetir a mesma história.",
  },
  {
    titulo: "Match com o que importa",
    texto:
      "Comparamos salário desejado, região, modelo de trabalho e benefícios antes de sugerir uma vaga.",
  },
  {
    titulo: "Resposta com prazo combinado",
    texto:
      "A empresa assume um prazo ao publicar. Se estourar, você é avisado e a nota dela cai.",
  },
];

export function Processo() {
  return (
    <section id="processo" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <p className="eyebrow">Como funciona</p>
      <h2 className="mt-2 max-w-xl text-3xl font-semibold md:text-4xl">
        Três compromissos que assumimos com você
      </h2>

      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {etapas.map((etapa, i) => (
          <li key={etapa.titulo} className="border-t-2 border-accent pt-5">
            <span className="font-display text-sm font-bold text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 text-lg font-semibold">{etapa.titulo}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{etapa.texto}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Empregadores() {
  return (
    <section id="empregadores" className="mx-auto max-w-6xl px-5 pb-20 md:pb-28">
      <div className="surface-card rounded-3xl px-6 py-12 text-center md:px-16 md:py-16">
        <p className="eyebrow">Para quem contrata</p>
        <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-semibold md:text-4xl">
          Publique com salário aberto e receba candidaturas de gente que quer o cargo
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Triagem por critérios objetivos, banco de talentos e retorno automático para quem não
          seguiu. Primeira vaga sem custo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#empregadores"
            className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform active:scale-[0.96]"
          >
            Publicar uma vaga
          </a>
          <a
            href="#empresas"
            className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-secondary"
          >
            Falar com o time
          </a>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-sand">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p className="font-display font-semibold text-ink">
          Candidatu<span className="text-accent">.</span>
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="#vagas" className="hover:text-accent">
            Vagas
          </a>
          <a href="#empresas" className="hover:text-accent">
            Avaliações
          </a>
          <a href="#empregadores" className="hover:text-accent">
            Empregadores
          </a>
          <a href="#processo" className="hover:text-accent">
            Privacidade
          </a>
        </nav>
        <p>© {new Date().getFullYear()} Candidatu</p>
      </div>
    </footer>
  );
}
