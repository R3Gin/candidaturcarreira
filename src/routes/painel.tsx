import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, type View } from "@/components/app/AppShell";
import { AppStoreProvider } from "@/components/app/store";
import { OnboardingDialog, shouldShowOnboarding } from "@/components/app/OnboardingDialog";
import { CentralVagas } from "@/components/app/views/CentralVagas";
import { EmpresasQueSigo } from "@/components/app/views/EmpresasQueSigo";
import { Historico } from "@/components/app/views/Historico";
import { MeuCurriculo } from "@/components/app/views/MeuCurriculo";
import { MinhaConta } from "@/components/app/views/MinhaConta";
import { Mensagens } from "@/components/app/views/Mensagens";
import { Reunioes } from "@/components/app/views/Reunioes";
import { MinhasCandidaturas } from "@/components/app/views/MinhasCandidaturas";
import { PreferenciasVagas } from "@/components/app/views/PreferenciasVagas";
import { Recomendadas } from "@/components/app/views/Recomendadas";
import { VagasSalvas } from "@/components/app/views/VagasSalvas";
import { VagaDetalhe } from "@/components/app/views/VagaDetalhe";
import { jobPool } from "@/components/app/store";
import { companyJobs } from "@/lib/companyJobs";


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
  const [onboarding, setOnboarding] = useState(false);
  const [openJobId, setOpenJobId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (shouldShowOnboarding()) setOnboarding(true);
  }, []);

  const signOut = () => {
    try {
      sessionStorage.removeItem("candidatu-session");
    } catch {
      /* ignore */
    }
    navigate({ to: "/" });
  };

  const openJob = (jobId: string) => {
    setOpenJobId(jobId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToJobs = () => {
    setOpenJobId(null);
    setView("central");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToApplications = () => {
    setOpenJobId(null);
    setView("candidaturas");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPreferences = () => {
    setOpenJobId(null);
    setView("preferencias");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeJob = openJobId
    ? ([...companyJobs(), ...jobPool].find((j) => j.id === openJobId) ?? null)
    : null;

  return (
    <AppShell
      view={view}
      onNavigate={(v) => {
        setOpenJobId(null);
        setView(v);
      }}
      onSignOut={signOut}
    >
      {onboarding && (
        <OnboardingDialog
          onFinish={() => setOnboarding(false)}
          onGoToProfile={() => {
            setOnboarding(false);
            setView("curriculo");
          }}
          onExit={() => {
            setOnboarding(false);
            signOut();
          }}
        />
      )}
      <main
        className={`mx-auto px-5 pb-20 pt-8 ${
          activeJob || view === "central" || view === "curriculo" ? "max-w-6xl" : "max-w-4xl"
        }`}
      >
        {activeJob ? (
          <VagaDetalhe
            job={activeJob}
            onBack={() => setOpenJobId(null)}
            onOpenJob={openJob}
            onGoToApplications={goToApplications}
          />
        ) : (
          <>
            {view === "central" && (
              <CentralVagas onGoToApplications={goToApplications} onOpenJob={openJob} />
            )}

        {view === "conta" && <MinhaConta onSignOut={signOut} />}
        {view === "curriculo" && <MeuCurriculo onGoToJobs={goToJobs} />}
        {view === "candidaturas" && <MinhasCandidaturas onGoToJobs={goToJobs} />}
        {view === "mensagens" && <Mensagens onGoToJobs={goToJobs} />}
        {view === "reunioes" && <Reunioes onGoToMessages={() => setView("mensagens")} />}
        {view === "recomendadas" && (
          <Recomendadas onGoToJobs={goToJobs} onGoToPreferences={goToPreferences} />
        )}
        {view === "salvas" && <VagasSalvas onGoToJobs={goToJobs} />}
        {view === "empresas" && <EmpresasQueSigo onGoToJobs={goToJobs} />}
        {view === "historico" && <Historico onGoToJobs={goToJobs} />}
            {view === "preferencias" && <PreferenciasVagas onGoToJobs={goToJobs} />}
          </>
        )}
      </main>
    </AppShell>
  );
}

