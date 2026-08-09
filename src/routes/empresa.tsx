import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompanyShell, type CompanyView } from "@/components/company/CompanyShell";
import { CompanyStoreProvider, useCompanyStore, type Permission } from "@/components/company/store";
import { Banco } from "@/components/company/views/Banco";
import { Entrevistas } from "@/components/company/views/Entrevistas";
import { Reunioes } from "@/components/company/views/Reunioes";
import { Equipe } from "@/components/company/views/Equipe";
import { Modelos } from "@/components/company/views/Modelos";
import { Marca } from "@/components/company/views/Marca";
import { PaginaEmpresa } from "@/components/company/views/PaginaEmpresa";
import { Pipeline } from "@/components/company/views/Pipeline";
import { Vagas } from "@/components/company/views/Vagas";
import { Visao } from "@/components/company/views/Visao";


const title = "Painel da empresa | Candidatu Empresas";
const description =
  "Publique vagas com salário aberto, selecione candidatos em um pipeline de etapas, agende entrevistas e acompanhe indicadores de contratação no painel empresarial do Candidatu.";

export const Route = createFileRoute("/empresa")({
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
  component: EmpresaPage,
});

function EmpresaPage() {
  return (
    <CompanyStoreProvider>
      <EmpresaGate />
    </CompanyStoreProvider>
  );
}

function Centro({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-5 py-16">
      <div className="surface-card w-full max-w-md rounded-2xl p-7 text-center">{children}</div>
    </main>
  );
}

function EmpresaGate() {
  const { loading, authenticated, company, createCompanyProfile } = useCompanyStore();
  const [form, setForm] = useState({ name: "", segment: "", city: "", website: "", about: "" });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  if (loading) {
    return (
      <Centro>
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand" />
        <p className="mt-3 text-sm text-muted-foreground">Carregando painel da empresa...</p>
      </Centro>
    );
  }

  if (!authenticated) {
    return (
      <Centro>
        <h1 className="font-display text-xl font-bold text-ink">Entre para acessar o painel</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O painel empresarial é exclusivo para contas de empresa. Faça login ou crie sua conta
          empresarial para publicar vagas e selecionar candidatos.
        </p>
        <Link
          to="/auth"
          className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Entrar ou criar conta
        </Link>
      </Centro>
    );
  }

  if (!company) {
    const campo =
      "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-brand";
    return (
      <Centro>
        <h1 className="font-display text-xl font-bold text-ink">Criar perfil da empresa</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Preencha os dados da sua empresa para começar a publicar vagas.
        </p>
        <form
          className="mt-5 space-y-3 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim() || !form.segment.trim() || !form.city.trim()) {
              setErro("Preencha nome, segmento e cidade.");
              return;
            }
            setErro("");
            setSaving(true);
            void createCompanyProfile({
              name: form.name.trim(),
              segment: form.segment.trim(),
              city: form.city.trim(),
              about: form.about.trim(),
              website: form.website.trim(),
            })
              .catch(() => setErro("Não foi possível criar a empresa. Tente novamente."))
              .finally(() => setSaving(false));
          }}
        >
          <label className="block text-xs font-semibold text-ink-soft">
            Nome da empresa
            <input
              className={campo}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Candidatu Tecnologia"
            />
          </label>
          <label className="block text-xs font-semibold text-ink-soft">
            Segmento
            <input
              className={campo}
              value={form.segment}
              onChange={(e) => setForm((f) => ({ ...f, segment: e.target.value }))}
              placeholder="Tecnologia"
            />
          </label>
          <label className="block text-xs font-semibold text-ink-soft">
            Cidade
            <input
              className={campo}
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="São Paulo"
            />
          </label>
          <label className="block text-xs font-semibold text-ink-soft">
            Site (opcional)
            <input
              className={campo}
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              placeholder="https://"
            />
          </label>
          <label className="block text-xs font-semibold text-ink-soft">
            Sobre a empresa (opcional)
            <textarea
              className={`${campo} min-h-20`}
              value={form.about}
              onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
              placeholder="Como é trabalhar na sua empresa"
            />
          </label>
          {erro && <p className="text-xs font-semibold text-destructive">{erro}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Criando..." : "Criar perfil da empresa"}
          </button>
        </form>
      </Centro>
    );
  }

  return <EmpresaDashboard />;
}


const viewPermission: Record<CompanyView, Permission> = {
  visao: "ver_visao",
  pipeline: "ver_pipeline",
  vagas: "ver_vagas",
  banco: "ver_banco",
  entrevistas: "ver_entrevistas",
  reunioes: "ver_reunioes",
  marca: "ver_marca",
  pagina: "ver_marca",
  modelos: "ver_modelos",
  equipe: "ver_equipe",
};

function EmpresaDashboard() {
  const { can } = useCompanyStore();
  const [view, setView] = useState<CompanyView>("visao");
  const allowed = can(viewPermission[view]);

  useEffect(() => {
    if (allowed) return;
    const fallback = (Object.keys(viewPermission) as CompanyView[]).find((v) =>
      can(viewPermission[v]),
    );
    if (fallback) setView(fallback);
  }, [allowed, can]);

  return (
    <CompanyShell view={view} onNavigate={setView}>
      {!allowed && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-ink-soft">
          Seu cargo não tem acesso a esta área.
        </div>
      )}
      {allowed && view === "visao" && <Visao onNavigate={setView} />}
      {allowed && view === "pipeline" && <Pipeline />}
      {allowed && view === "vagas" && <Vagas onOpenPipeline={() => setView("pipeline")} />}
      {allowed && view === "banco" && <Banco />}
      {allowed && view === "entrevistas" && <Entrevistas />}
      {allowed && view === "reunioes" && <Reunioes />}
      {allowed && view === "marca" && <Marca />}
      {allowed && view === "pagina" && <PaginaEmpresa />}
      {allowed && view === "modelos" && <Modelos />}
      {allowed && view === "equipe" && <Equipe />}
    </CompanyShell>
  );

}
