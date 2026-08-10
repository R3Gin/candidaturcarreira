import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { allFreelas, brlDiaria, contactHref, type Freela } from "@/lib/freelas";
import {
  candidateDefaults,
  contactForFreela,
  requestFreelaContact,
  subscribeFreelaContacts,
  type FreelaContact,
} from "@/lib/freelaContacts";

export const Route = createFileRoute("/freelance/$id")({
  loader: ({ params }) => ({
    id: params.id,
    cargo: null as string | null,
    empresa: null as string | null,
  }),
  head: ({ loaderData }) => {
    if (!loaderData?.cargo) {
      return {
        meta: [
          { title: "Freela | Candidatu" },
          { name: "description", content: "Detalhes da oportunidade de freelance no Candidatu." },
        ],
      };
    }
    const title = `${loaderData.cargo} — freela em ${loaderData.empresa} | Candidatu`;
    const description = `Diária, carga horária e descrição completa do freela ${loaderData.cargo} na ${loaderData.empresa}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: FreelaDetalhe,
  notFoundComponent: () => (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Freela não encontrado</h1>
        <Link to="/freelance" className="mt-4 inline-block text-sm font-semibold text-brand">
          Voltar para os freelas
        </Link>
      </section>
      <SiteFooter />
    </main>
  ),
});

function FreelaDetalhe() {
  const { id } = Route.useParams();
  const [freela, setFreela] = useState<Freela | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    allFreelas()
      .then((lista) => {
        if (!ativo) return;
        setFreela(lista.find((f) => f.id === id) ?? null);
      })
      .catch(() => {
        if (ativo) setFreela(null);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) {
    return (
      <main>
        <SiteHeader />
        <section className="mx-auto max-w-3xl px-5 py-24 text-center text-sm text-muted-foreground">
          Carregando freela...
        </section>
        <SiteFooter />
      </main>
    );
  }

  if (!freela) throw notFound();

  return (
    <main>
      <SiteHeader />

      <section className="brand-gradient text-primary-foreground">
        <div className="mx-auto max-w-5xl px-5 py-12 md:py-16">
          <Link
            to="/freelance"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-foreground/70 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Todos os freelas
          </Link>
          <h1 className="mt-4 text-2xl font-semibold md:text-4xl">{freela.cargo}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-primary-foreground/75">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-4 w-4" /> {freela.empresa}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {freela.local}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> Publicado {freela.data.toLowerCase()}
            </span>
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-12 md:grid-cols-[minmax(0,1fr)_18rem] md:py-16">
        <div className="space-y-6">
          <div className="surface-card rounded-2xl p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Sobre o freela</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{freela.descricao}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {freela.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-ink-soft"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-2xl p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Condições</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <Info label="Valor da diária" value={`${brlDiaria(freela.diariaValor)} / dia`} />
              <Info label="Carga horária" value={freela.carga} />
              <Info label="Período" value={freela.periodo} />
              <Info label="Modelo e local" value={freela.local} />
            </dl>
          </div>
        </div>

        <aside className="space-y-4 md:sticky md:top-24 md:self-start">
          <div className="surface-card rounded-2xl p-5">
            <p className="flex items-center gap-2 text-lg font-bold text-ink">
              <Wallet className="h-5 w-5 text-accent" strokeWidth={2} />
              {brlDiaria(freela.diariaValor)}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
              <Clock className="h-4 w-4" /> {freela.carga} · {freela.periodo}
            </p>
            <span
              className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${
                freela.aberto && freela.quando === "hoje"
                  ? "bg-mint text-ink"
                  : "bg-secondary text-ink-soft"
              }`}
            >
              {freela.aberto && freela.quando === "hoje" ? "Aberto" : "Encerrado"}
            </span>
            <ContatoBox freela={freela} />
            {freela.contato && (
              <a
                href={contactHref(freela.contato)}
                className="mt-2 block text-center text-xs font-semibold text-ink-soft hover:text-brand"
              >
                Ou fale direto: {freela.contato}
              </a>
            )}
          </div>
        </aside>
      </section>

      <AdSlot className="pb-10" slot="5555555555" />

      <SiteFooter />

    </main>
  );
}

function ContatoBox({ freela }: { freela: Freela }) {
  const [enviado, setEnviado] = useState<FreelaContact | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", contato: "", mensagem: "" });

  useEffect(() => {
    const sync = () => setEnviado(contactForFreela(freela.id));
    sync();
    const d = candidateDefaults();
    setForm((f) => ({ ...f, nome: f.nome || d.nome, contato: f.contato || d.contato }));
    return subscribeFreelaContacts(sync);
  }, [freela.id]);

  const enviar = () => {
    if (form.nome.trim().length < 3) {
      toast.error("Informe seu nome completo");
      return;
    }
    if (form.contato.trim().length < 8) {
      toast.error("Informe um e-mail ou telefone para a empresa te responder");
      return;
    }
    requestFreelaContact({
      freelaId: freela.id,
      cargo: freela.cargo,
      empresa: freela.empresa,
      diaria: freela.diariaValor,
      nome: form.nome.trim(),
      contato: form.contato.trim(),
      mensagem: form.mensagem,
    });
    setOpen(false);
    toast.success(`Solicitação enviada para ${freela.empresa}`, {
      description: "Um chat foi aberto e a conversa aparece no seu painel de freelas.",
    });
  };

  if (enviado) {
    return (
      <div className="mt-4 rounded-xl bg-mint/60 p-3">
        <p className="inline-flex items-center gap-1.5 text-sm font-bold text-ink">
          <Check className="h-4 w-4" strokeWidth={2.5} /> Solicitação enviada
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          Chat aberto com {enviado.empresa}. Acompanhe as respostas em Mensagens.
        </p>
        <Link
          to="/freelance"
          className="mt-2 inline-block text-xs font-semibold text-brand hover:underline"
        >
          Ver no painel de freelas
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
      >
        <MessageCircle className="h-4 w-4" strokeWidth={2} /> Contato
      </button>
      {open && (
        <div className="mt-3 space-y-2 rounded-xl border border-border bg-secondary/60 p-3">
          <p className="text-xs text-ink-soft">
            Enviamos sua solicitação para {freela.empresa} e abrimos um chat com a equipe.
          </p>
          <input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Seu nome completo"
            className={inputCls}
          />
          <input
            value={form.contato}
            onChange={(e) => setForm({ ...form, contato: e.target.value })}
            placeholder="E-mail ou WhatsApp"
            className={inputCls}
          />
          <textarea
            rows={3}
            value={form.mensagem}
            onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
            placeholder="Mensagem para a empresa (opcional)"
            className={inputCls}
          />
          <button
            type="button"
            onClick={enviar}
            className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Enviar solicitação e abrir chat
          </button>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-brand-cyan";

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
