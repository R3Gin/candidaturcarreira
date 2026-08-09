import { Link } from "@tanstack/react-router";
import {
  MessageSquare,
  Bell,
  Bookmark,
  Building2,
  FileText,
  History as HistoryIcon,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAppStore } from "./store";
import { useChatMessageNotifications, useChatUnread } from "@/lib/useChat";


export type View =
  | "central"
  | "conta"
  | "curriculo"
  | "candidaturas"
  | "mensagens"
  | "salvas"
  | "empresas"
  | "preferencias"
  | "recomendadas"
  | "historico";

const menu: { label: string; icon: typeof UserRound; view: View; badge?: string }[] = [
  { label: "Minha conta", icon: UserRound, view: "conta" },
  { label: "Meu currículo", icon: FileText, view: "curriculo", badge: "IA" },
  { label: "Minhas candidaturas", icon: LayoutDashboard, view: "candidaturas" },
  { label: "Mensagens", icon: MessageSquare, view: "mensagens" },
  { label: "Recomendadas para você", icon: Sparkles, view: "recomendadas", badge: "Novo" },
  { label: "Vagas salvas", icon: Bookmark, view: "salvas" },
  { label: "Empresas que sigo", icon: Building2, view: "empresas" },
  { label: "Histórico de ações", icon: HistoryIcon, view: "historico" },
  { label: "Preferências de vagas", icon: Settings, view: "preferencias", badge: "Revisar" },
];


export function AppShell({
  children,
  view,
  onNavigate,
  onSignOut,
}: {
  children: ReactNode;
  view: View;
  onNavigate: (v: View) => void;
  onSignOut: () => void;
}) {
  const [openAccount, setOpenAccount] = useState(false);
  const chatUnread = useChatUnread("candidato");
  const [openAlerts, setOpenAlerts] = useState(false);
  const {
    account,
    savedJobs,
    preferences,
    alerts,
    unreadAlerts,
    markAlertsRead,
    dismissAlert,
    resume,
  } = useAppStore();

  // Alerta em tempo real: avisa em tela assim que uma vaga compatível entra.
  useEffect(() => {
    const latest = alerts[0];
    if (!latest || latest.read) return;
    toast(latest.title, {
      description: latest.detail,
      action: { label: "Ver vagas", onClick: () => go("recomendadas") },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts[0]?.id]);

  // Notificação em tempo real de novas mensagens no chat com as empresas.
  useChatMessageNotifications("candidato", { onOpen: () => go("mensagens") });

  const initials = account.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const firstName = account.name.split(" ")[0];
  const completion =
    45 + (savedJobs.length > 0 ? 10 : 0) + (preferences ? 20 : 0) + (resume ? 25 : 0);


  const go = (v: View) => {
    onNavigate(v);
    setOpenAccount(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-sand">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-base font-bold text-primary-foreground">
              C
            </span>
            <span className="hidden font-display text-lg font-semibold tracking-tight sm:inline">
              Candidatu<span className="text-accent">.</span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-6 md:flex">
            <button
              type="button"
              onClick={() => go("central")}
              className="relative text-sm font-semibold text-ink"
            >
              Painel
              {view === "central" && (
                <span className="absolute -bottom-[22px] left-0 h-[3px] w-full rounded-full bg-accent" />
              )}
            </button>
            <button
              type="button"
              onClick={() => go("salvas")}
              className="text-sm font-medium text-ink-soft hover:text-accent"
            >
              Vagas salvas
            </button>
            <button
              type="button"
              onClick={() => go("empresas")}
              className="text-sm font-medium text-ink-soft hover:text-accent"
            >
              Empresas
            </button>
            <button
              type="button"
              onClick={() => go("candidaturas")}
              className="text-sm font-medium text-ink-soft hover:text-accent"
            >
              Candidaturas
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              aria-label={`Mensagens${chatUnread ? ` (${chatUnread} não lidas)` : ""}`}
              onClick={() => go("mensagens")}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-secondary"
            >
              <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
              {chatUnread > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {chatUnread > 9 ? "9+" : chatUnread}
                </span>
              )}
            </button>
            <button
              type="button"
              aria-label="Buscar vagas"
              onClick={() => go("central")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-secondary"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <div className="relative">
              <button
                type="button"
                aria-label="Notificações de vagas compatíveis"
                onClick={() => {
                  setOpenAlerts((o) => !o);
                  markAlertsRead();
                }}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-secondary"
              >
                <Bell className="h-5 w-5" strokeWidth={1.75} />
                {unreadAlerts > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                    {unreadAlerts}
                  </span>
                )}
              </button>
              {openAlerts && (
                <>
                  <button
                    type="button"
                    aria-label="Fechar notificações"
                    onClick={() => setOpenAlerts(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div className="absolute right-0 top-12 z-50 w-[min(340px,86vw)] rounded-2xl border border-border bg-card p-3 shadow-card">
                    <p className="px-1 pb-2 text-xs font-bold text-ink">
                      Alertas em tempo real
                      <span className="ml-1 font-medium text-muted-foreground">
                        · vagas compatíveis com seu perfil
                      </span>
                    </p>
                    {alerts.length === 0 ? (
                      <p className="px-1 pb-1 text-xs text-ink-soft">
                        Nenhum alerta ainda. Assim que uma vaga combinar com suas preferências,
                        avisamos aqui na hora.
                      </p>
                    ) : (
                      <ul className="max-h-72 space-y-1.5 overflow-y-auto">
                        {alerts.slice(0, 8).map((a) => (
                          <li
                            key={a.id}
                            className="flex items-start gap-2 rounded-xl bg-secondary p-2.5"
                          >
                            <Sparkles
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
                              strokeWidth={2}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setOpenAlerts(false);
                                go("recomendadas");
                              }}
                              className="min-w-0 flex-1 text-left"
                            >
                              <span className="block text-xs font-semibold text-ink">{a.title}</span>
                              <span className="block text-[11px] text-ink-soft">{a.detail}</span>
                            </button>
                            <button
                              type="button"
                              aria-label="Descartar alerta"
                              onClick={() => dismissAlert(a.id)}
                              className="text-ink-soft hover:text-destructive"
                            >
                              <X className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setOpenAlerts(false);
                        go("preferencias");
                      }}
                      className="mt-2 w-full rounded-full bg-secondary py-2 text-xs font-semibold text-ink"
                    >
                      Ajustar preferências de alerta
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpenAccount(true)}
              aria-label="Abrir menu da conta"
              className="ml-1 flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm font-semibold text-ink shadow-card"
            >
              {account.photo ? (
                <img src={account.photo} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint font-display text-xs font-bold text-ink">
                  {initials}
                </span>
              )}
              <span className="hidden sm:inline">{firstName}</span>
            </button>
          </div>
        </div>
      </header>

      {children}

      {openAccount && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setOpenAccount(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
          />
          <aside className="relative h-full w-[min(340px,90vw)] overflow-y-auto border-l border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {account.photo ? (
                  <img src={account.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint font-display text-sm font-bold text-ink">
                    {initials}
                  </span>
                )}
                <div>
                  <p className="font-display text-base font-semibold text-ink">{account.name}</p>
                  {account.occupation && (
                    <p className="text-xs text-ink-soft">{account.occupation}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => go("conta")}
                    className="text-xs font-semibold text-accent"
                  >
                    Editar perfil
                  </button>
                </div>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setOpenAccount(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-secondary"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-secondary p-4">
              <p className="eyebrow">Perfil</p>
              <p className="mt-1 text-sm font-semibold text-ink">{completion}% completo</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full bg-accent" style={{ width: `${completion}%` }} />
              </div>
            </div>

            <nav className="mt-4 divide-y divide-border">
              {menu.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => go(item.view)}
                  className={`flex w-full items-center gap-3 py-3 text-left text-sm font-medium transition-colors hover:text-accent ${
                    view === item.view ? "text-accent" : "text-ink"
                  }`}
                >
                  <item.icon className="h-4.5 w-4.5 text-ink-soft" strokeWidth={1.75} />
                  {item.label}
                  {item.view === "mensagens" && chatUnread > 0 ? (
                    <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
                      {chatUnread} nova{chatUnread > 1 ? "s" : ""}
                    </span>
                  ) : (
                    item.badge && (
                      <span className="ml-auto rounded-full bg-mint px-2 py-0.5 text-[11px] font-bold text-ink">
                        {item.badge}
                      </span>
                    )
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go("central")}
                className="flex w-full items-center gap-3 py-3 text-left text-sm font-medium text-ink transition-colors hover:text-accent"
              >
                <Sparkles className="h-4.5 w-4.5 text-ink-soft" strokeWidth={1.75} />
                Central de empregabilidade
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenAccount(false);
                  onSignOut();
                }}
                className="flex w-full items-center gap-3 py-3 text-left text-sm font-semibold text-ink-soft hover:text-accent"
              >
                <LogOut className="h-4.5 w-4.5" strokeWidth={1.75} />
                Sair
              </button>
            </nav>

            <p className="mt-5 text-xs text-muted-foreground">
              Termos de uso · Aviso de privacidade do Candidatu
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
