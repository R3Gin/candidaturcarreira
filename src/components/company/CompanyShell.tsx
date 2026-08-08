import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  KanbanSquare,
  LogOut,
  Menu,
  MoveRight,
  ShieldCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useCompanyStore, type NotificationKind, type Permission } from "./store";

const notifIcon: Record<NotificationKind, typeof Bell> = {
  etapa: MoveRight,
  aprovado: CheckCircle2,
  reprovado: XCircle,
  entrevista: CalendarDays,
};

function NotificationBell() {
  const { notifications, unreadCount, markNotificationsRead, clearNotifications } =
    useCompanyStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notificações${unreadCount ? ` (${unreadCount} não lidas)` : ""}`}
        onClick={() => {
          if (!open) markNotificationsRead();
          setOpen((o) => !o);
        }}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-ink hover:bg-secondary"
      >
        <Bell className="h-5 w-5" strokeWidth={1.9} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fechar notificações"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="font-display text-sm font-bold text-ink">Notificações</p>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearNotifications}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {notifications.map((n) => {
                const Icon = notifIcon[n.kind];
                return (
                  <li key={n.id} className="flex gap-3 px-4 py-3">
                    <Icon
                      className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${
                        n.kind === "reprovado"
                          ? "text-destructive"
                          : n.kind === "aprovado"
                            ? "text-brand-cyan"
                            : "text-brand"
                      }`}
                      strokeWidth={2}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight text-ink">{n.title}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">{n.detail}</p>
                      <p className="mt-1 text-[11px] text-ink-soft">{n.at}</p>
                    </div>
                  </li>
                );
              })}
              {notifications.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-ink-soft">
                  Nenhuma notificação por aqui. Mova alguém no pipeline para começar.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}


export type CompanyView =
  | "visao"
  | "pipeline"
  | "vagas"
  | "banco"
  | "entrevistas"
  | "marca"
  | "equipe";

const menu: { label: string; icon: typeof Users; view: CompanyView; permission: Permission }[] = [
  { label: "Visão geral", icon: BarChart3, view: "visao", permission: "ver_visao" },
  { label: "Pipeline de seleção", icon: KanbanSquare, view: "pipeline", permission: "ver_pipeline" },
  { label: "Vagas publicadas", icon: Briefcase, view: "vagas", permission: "ver_vagas" },
  { label: "Banco de talentos", icon: Users, view: "banco", permission: "ver_banco" },
  {
    label: "Agenda de entrevistas",
    icon: CalendarDays,
    view: "entrevistas",
    permission: "ver_entrevistas",
  },
  { label: "Marca empregadora", icon: Building2, view: "marca", permission: "ver_marca" },
  { label: "Equipe e permissões", icon: ShieldCheck, view: "equipe", permission: "ver_equipe" },
];

export function CompanyShell({
  children,
  view,
  onNavigate,
}: {
  children: ReactNode;
  view: CompanyView;
  onNavigate: (v: CompanyView) => void;
}) {
  const { profile, candidates, interviews, currentMember, can } = useCompanyStore();
  const [open, setOpen] = useState(false);
  const active = candidates.filter((c) => !c.rejected && c.stage !== "Contratado").length;
  const visible = menu.filter((item) => can(item.permission));


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Abrir menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-ink lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            <span className="brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-xl font-display text-sm font-bold text-primary-foreground">
              C
            </span>
            <span className="font-display text-lg font-bold text-ink">
              Candidatu <span className="text-brand-cyan">Empresas</span>
            </span>
          </Link>

          <div className="ml-auto hidden items-center gap-3 sm:flex">
            <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-ink-soft">
              {active} candidaturas em andamento
            </span>
            <span className="rounded-full bg-mint px-3 py-1.5 text-xs font-bold text-ink">
              {interviews.length} entrevistas agendadas
            </span>
          </div>

          <div className="flex items-center gap-2 sm:ml-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-ink">{currentMember.name}</p>
              <p className="text-[11px] text-ink-soft">
                {profile.name} · {currentMember.role}
              </p>
            </div>
            <span className="brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-full font-display text-xs font-bold text-primary-foreground">
              {currentMember.name.slice(0, 2).toUpperCase()}
            </span>
          </div>

        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside
          className={`${
            open ? "block" : "hidden"
          } fixed inset-x-4 top-20 z-30 rounded-2xl border border-border bg-card p-3 shadow-lift lg:static lg:block lg:w-64 lg:shrink-0 lg:self-start lg:bg-transparent lg:p-0 lg:shadow-none`}
        >
          <nav className="space-y-1 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-3 lg:shadow-card">
            {visible.map((item) => {
              const isActive = view === item.view;
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => {
                    onNavigate(item.view);
                    setOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-brand text-primary-foreground"
                      : "text-ink-soft hover:bg-secondary hover:text-ink"
                  }`}
                >
                  <item.icon className="h-4.5 w-4.5" strokeWidth={1.9} />
                  {item.label}
                </button>
              );
            })}
            <Link
              to="/painel"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink-soft hover:bg-secondary hover:text-ink"
            >
              <Users className="h-4.5 w-4.5" strokeWidth={1.9} />
              Ver como candidato
            </Link>
            <Link
              to="/"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-destructive hover:bg-secondary"
            >
              <LogOut className="h-4.5 w-4.5" strokeWidth={1.9} />
              Sair
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
