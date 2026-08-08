import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CompanyShell, type CompanyView } from "@/components/company/CompanyShell";
import { CompanyStoreProvider } from "@/components/company/store";
import { Banco } from "@/components/company/views/Banco";
import { Entrevistas } from "@/components/company/views/Entrevistas";
import { Marca } from "@/components/company/views/Marca";
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

function EmpresaDashboard() {
  const [view, setView] = useState<CompanyView>("visao");

  return (
    <CompanyShell view={view} onNavigate={setView}>
      {view === "visao" && <Visao onNavigate={setView} />}
      {view === "pipeline" && <Pipeline />}
      {view === "vagas" && <Vagas onOpenPipeline={() => setView("pipeline")} />}
      {view === "banco" && <Banco />}
      {view === "entrevistas" && <Entrevistas />}
      {view === "marca" && <Marca />}
    </CompanyShell>
  );
}
