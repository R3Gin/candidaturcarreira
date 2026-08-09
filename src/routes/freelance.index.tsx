import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Building2, Clock, MapPin, Search, Star, Trophy, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Reveal } from "@/components/site/Reveal";
import { allFreelas, brlDiaria, contactHref, freelasBase, type Freela } from "@/lib/freelas";
import {
  brl,
  computeMetrics,
  readAccount,
  seedAccount,
  subscribeAccount,
  type FreelaAccount,
} from "@/lib/freelaAccount";
import {
  readFreelaContacts,
  subscribeFreelaContacts,
  type FreelaContact,
} from "@/lib/freelaContacts";
import { FreelaMenu, FreelaMenuTrigger, type FreelaView } from "@/components/freela/FreelaMenu";
import {
  AvaliacoesPanel,
  ContatosPanel,
  GanhosPanel,
  JobsPanel,
  NovoJobForm,
  RankingPanel,
  StatsRow,
} from "@/components/freela/FreelaPanels";

const title = "Freelas do dia | Candidatu";
const description =
  "Busque freelas por cargo, empresa ou cidade, filtre por período e modelo e ordene por data ou valor da diária. Carga horária, empresa e descrição em cada vaga.";

export const Route = createFileRoute("/freelance/")({
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

const filtros = [
  { key: "hoje", label: "Freelas de hoje" },
  { key: "anterior", label: "Dias anteriores" },
  { key: "todos", label: "Todos" },
] as const;

const ordens = [
  { key: "recentes", label: "Mais recentes" },
  { key: "antigos", label: "Mais antigos" },
  { key: "diaria-desc", label: "Maior diária" },
  { key: "diaria-asc", label: "Menor diária" },
] as const;

const modelos = ["Todos", "Remoto", "Presencial"] as const;

const titulos: Record<Exclude<FreelaView, "freelas">, string> = {
  jobs: "Trabalhos já feitos",
  avaliacoes: "Avaliações das empresas",
  ranking: "Nível e ranking",
  ganhos: "Diárias e ganhos",
  contatos: "Contatos e chats",
  novo: "Registrar job",
};

function FreelancePage() {
  const [lista, setLista] = useState<Freela[]>(freelasBase);
  const [filtro, setFiltro] = useState<(typeof filtros)[number]["key"]>("hoje");
  const [ordem, setOrdem] = useState<(typeof ordens)[number]["key"]>("recentes");
  const [modelo, setModelo] = useState<(typeof modelos)[number]>("Todos");
  const [query, setQuery] = useState("");
  const [minDiaria, setMinDiaria] = useState(0);

  const [contatos, setContatos] = useState<FreelaContact[]>([]);
  const [acc, setAcc] = useState<FreelaAccount | null>(null);
  const [view, setView] = useState<FreelaView>("freelas");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLista(allFreelas());
    const syncContatos = () => setContatos(readFreelaContacts());
    const syncAcc = () => setAcc(readAccount());
    syncContatos();
    syncAcc();
    const un1 = subscribeFreelaContacts(syncContatos);
    const un2 = subscribeAccount(syncAcc);
    return () => {
      un1();
      un2();
    };
  }, []);

  const resultado = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = lista.filter((f) => {
      if (filtro !== "todos" && f.quando !== filtro) return false;
      if (modelo !== "Todos" && !f.local.toLowerCase().includes(modelo.toLowerCase())) return false;
      if (f.diariaValor < minDiaria) return false;
      if (q && !`${f.cargo} ${f.empresa} ${f.local} ${f.tags.join(" ")}`.toLowerCase().includes(q))
        return false;
      return true;
    });
    const byDate = (a: Freela, b: Freela) => +new Date(b.publishedAt) - +new Date(a.publishedAt);
    return out.sort((a, b) => {
      if (ordem === "recentes") return byDate(a, b);
      if (ordem === "antigos") return -byDate(a, b);
      if (ordem === "diaria-desc") return b.diariaValor - a.diariaValor;
      return a.diariaValor - b.diariaValor;
    });
  }, [lista, filtro, modelo, minDiaria, query, ordem]);

  const hoje = lista.filter((f) => f.quando === "hoje").length;
  const conta = acc ?? seedAccount;

  const navigate = (v: FreelaView) => {
    setView(v);
    setMenuOpen(false);
  };

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
            {hoje} freelas abertos hoje. Busque por cargo, empresa ou cidade, ordene por data ou
            valor da diária e veja a descrição completa antes de falar com a empresa.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {view !== "freelas" && (
            <button
              type="button"
              onClick={() => setView("freelas")}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-secondary"
            >
              ← Voltar aos freelas
            </button>
          )}
          <div className="ml-auto">
            <FreelaMenuTrigger acc={acc} onOpen={() => setMenuOpen(true)} />
          </div>
        </div>

        {view !== "freelas" ? (
          <div className="space-y-6">
            <header>
              <p className="eyebrow">Conta de freelancer</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-ink">{titulos[view]}</h2>
            </header>
            <StatsRow acc={conta} />
            {view === "jobs" && <JobsPanel acc={conta} />}
            {view === "avaliacoes" && <AvaliacoesPanel acc={conta} />}
            {view === "ranking" && <RankingPanel acc={conta} />}
            {view === "ganhos" && <GanhosPanel acc={conta} />}
            {view === "contatos" && <ContatosPanel contatos={contatos} />}
            {view === "novo" && <NovoJobForm />}
          </div>
        ) : (
          <>
            <div className="surface-card rounded-2xl p-4">
              <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                <Search className="h-4 w-4 text-ink-soft" strokeWidth={1.75} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Busque por cargo, empresa ou cidade"
                  aria-label="Buscar freelas"
                  className="w-full bg-transparent text-sm text-ink outline-none"
                />
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
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

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-soft">
                    Ordenar por
                  </span>
                  <select
                    value={ordem}
                    onChange={(e) => setOrdem(e.target.value as typeof ordem)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink outline-none"
                  >
                    {ordens.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-soft">
                    Modelo
                  </span>
                  <select
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value as typeof modelo)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink outline-none"
                  >
                    {modelos.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-soft">
                    Diária mínima: {brlDiaria(minDiaria)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={600}
                    step={20}
                    value={minDiaria}
                    onChange={(e) => setMinDiaria(Number(e.target.value))}
                    className="mt-2 w-full accent-[hsl(var(--accent))]"
                  />
                </label>
              </div>

              <p className="mt-3 text-xs font-semibold text-ink-soft">
                {resultado.length}{" "}
                {resultado.length === 1 ? "freela encontrado" : "freelas encontrados"}
              </p>
            </div>

            <MinhaContaCard acc={acc} onOpen={() => setMenuOpen(true)} />

            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {resultado.map((f, i) => (
                <Reveal
                  as="li"
                  key={f.id}
                  delay={i * 60}
                  className="surface-card flex flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-2">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                      <Building2 className="h-5 w-5 text-ink-soft" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold leading-snug">
                        <Link to="/freelance/$id" params={{ id: f.id }} className="hover:underline">
                          {f.cargo}
                        </Link>
                      </h2>
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
                      {brlDiaria(f.diariaValor)} / diária
                    </p>
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <Clock className="h-4 w-4 text-accent" strokeWidth={2} />
                      {f.carga} · {f.periodo}
                    </p>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {f.descricao}
                  </p>

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

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <Link
                      to="/freelance/$id"
                      params={{ id: f.id }}
                      className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                    >
                      Ver detalhes
                    </Link>
                    {f.contato && (
                      <a
                        href={contactHref(f.contato)}
                        className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-secondary"
                      >
                        Contato
                      </a>
                    )}
                    <span className="ml-auto text-xs font-semibold text-ink-soft">{f.data}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${
                        f.aberto && f.quando === "hoje"
                          ? "bg-mint text-ink"
                          : "bg-secondary text-ink-soft"
                      }`}
                    >
                      {f.aberto && f.quando === "hoje" ? "Aberto" : "Encerrado"}
                    </span>
                  </div>
                </Reveal>
              ))}
            </ul>

            {resultado.length === 0 && (
              <p className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-ink-soft">
                Nenhum freela encontrado com esses filtros.
              </p>
            )}
          </>
        )}
      </section>

      {menuOpen && acc && (
        <FreelaMenu
          acc={acc}
          view={view}
          contatos={contatos.length}
          onNavigate={navigate}
          onClose={() => setMenuOpen(false)}
        />
      )}

      <SiteFooter />
    </main>
  );
}

function MinhaContaCard({ acc, onOpen }: { acc: FreelaAccount | null; onOpen: () => void }) {
  if (!acc) return null;
  const m = computeMetrics(acc);

  return (
    <section className="surface-card mt-6 flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <p className="eyebrow">Minha conta freela</p>
        <h2 className="mt-1 font-display text-lg font-semibold text-ink">
          Nível {m.level.nome} · #{m.posicao} no ranking
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={0} />
            {m.rating.toFixed(2)} ({m.avaliacoes})
          </span>
          <span>{m.diarias} diárias</span>
          <span>{brl(m.ganho)} ganhos</span>
          <span className="inline-flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
            Chance {m.chance}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="sm:ml-auto shrink-0 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-transform duration-200 active:scale-[0.96]"
      >
        Abrir menu da conta
      </button>
    </section>
  );
}
