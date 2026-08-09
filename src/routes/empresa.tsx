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
      <EmpresaDashboard />
    </CompanyStoreProvider>
  );
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
