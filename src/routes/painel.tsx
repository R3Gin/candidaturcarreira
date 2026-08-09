import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, type View } from "@/components/app/AppShell";
import { AppStoreProvider, useAppStore } from "@/components/app/store";
import { OnboardingDialog } from "@/components/app/OnboardingDialog";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/components/auth/AuthModal";
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
  const { loading, authenticated } = useAppStore();
  const { signOut } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [view, setView] = useState<View>("central");
  const [openJobId, setOpenJobId] = useState<string | null>(null);
  const navigate = useNavigate();

  const doSignOut = () => {
    void signOut().then(() => navigate({ to: "/" }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand">
        <p className="text-sm font-semibold text-ink-soft">Carregando seu painel…</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand p-6">
        <div className="max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <p className="font-display text-lg font-semibold text-ink">
            Faça login para acessar seu painel
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Entre na sua conta de candidato para ver vagas, candidaturas e preferências.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal({ mode: "entrar", accountType: "candidato" })}
            className="mt-5 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  return <PainelLoaded view={view} setView={setView} openJobId={openJobId} setOpenJobId={setOpenJobId} onSignOut={doSignOut} />;
}

function PainelLoaded({
  view,
  setView,
  openJobId,
  setOpenJobId,
  onSignOut,
}: {
  view: View;
  setView: (v: View) => void;
  openJobId: string | null;
  setOpenJobId: (id: string | null) => void;
  onSignOut: () => void;
}) {
  const { account, jobs } = useAppStore();
  const [onboarding, setOnboarding] = useState(!account.onboardedAt);

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

  const activeJob = openJobId ? (jobs.find((j) => j.id === openJobId) ?? null) : null;

  return (
    <AppShell
      view={view}
      onNavigate={(v) => {
        setOpenJobId(null);
        setView(v);
      }}
      onSignOut={onSignOut}
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
            onSignOut();
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

            {view === "conta" && <MinhaConta onSignOut={onSignOut} />}
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
