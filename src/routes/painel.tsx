import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, type View } from "@/components/app/AppShell";
import { AppStoreProvider } from "@/components/app/store";
import { CentralVagas } from "@/components/app/views/CentralVagas";
import { EmpresasQueSigo } from "@/components/app/views/EmpresasQueSigo";
import { MeuCurriculo } from "@/components/app/views/MeuCurriculo";
import { MinhaConta } from "@/components/app/views/MinhaConta";
import { MinhasCandidaturas } from "@/components/app/views/MinhasCandidaturas";
import { PreferenciasVagas } from "@/components/app/views/PreferenciasVagas";
import { VagasSalvas } from "@/components/app/views/VagasSalvas";

const title = "Painel do candidato | Candidatu";
const description =
  "Gerencie sua conta, currículo, candidaturas, vagas salvas, empresas que você segue e preferências de vagas no painel do Candidatu.";

export const Route = createFileRoute("/painel")({
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
  component: PainelPage,
});

function PainelPage() {
  return (
    <AppStoreProvider>
      <Painel />
    </AppStoreProvider>
  );
}

function Painel() {
  const [view, setView] = useState<View>("central");
  const navigate = useNavigate();

  const signOut = () => {
    try {
      sessionStorage.removeItem("candidatu-session");
    } catch {
      /* ignore */
    }
    navigate({ to: "/" });
  };

  const goToJobs = () => {
    setView("central");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToApplications = () => {
    setView("candidaturas");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppShell view={view} onNavigate={setView} onSignOut={signOut}>
      <main
        className={`mx-auto px-5 pb-20 pt-8 ${view === "central" ? "max-w-6xl" : "max-w-4xl"}`}
      >
        {view === "central" && <CentralVagas onGoToApplications={goToApplications} />}

        {view === "conta" && <MinhaConta onSignOut={signOut} />}
        {view === "curriculo" && <MeuCurriculo onGoToJobs={goToJobs} />}
        {view === "candidaturas" && <MinhasCandidaturas onGoToJobs={goToJobs} />}
        {view === "salvas" && <VagasSalvas onGoToJobs={goToJobs} />}
        {view === "empresas" && <EmpresasQueSigo onGoToJobs={goToJobs} />}
        {view === "preferencias" && <PreferenciasVagas onGoToJobs={goToJobs} />}
      </main>
    </AppShell>
  );
}
