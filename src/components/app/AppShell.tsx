import { Link } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const menu = [
  { label: "Minha conta", icon: UserRound, badge: null },
  { label: "Meu currículo", icon: FileText, badge: "Revisar" },
  { label: "Minhas candidaturas", icon: LayoutDashboard, badge: null },
  { label: "Vagas salvas", icon: Bookmark, badge: null },
  { label: "Empresas que sigo", icon: Building2, badge: null },
  { label: "Preferências de vagas", icon: Settings, badge: "Revisar" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [openAccount, setOpenAccount] = useState(false);

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
            <span className="relative text-sm font-semibold text-ink">
              Painel
              <span className="absolute -bottom-[22px] left-0 h-[3px] w-full rounded-full bg-accent" />
            </span>
            <Link to="/" className="text-sm font-medium text-ink-soft hover:text-accent">
              Vagas
            </Link>
            <Link to="/" className="text-sm font-medium text-ink-soft hover:text-accent">
              Empresas
            </Link>
            <Link to="/" className="text-sm font-medium text-ink-soft hover:text-accent">
              Salários
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Buscar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-secondary"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="Notificações"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-secondary"
            >
              <Bell className="h-5 w-5" strokeWidth={1.75} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
            </button>
            <button
              type="button"
              onClick={() => setOpenAccount(true)}
              aria-label="Abrir menu da conta"
              className="ml-1 flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm font-semibold text-ink shadow-card"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint font-display text-xs font-bold text-ink">
                EM
              </span>
              <span className="hidden sm:inline">Eduardo</span>
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
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint font-display text-sm font-bold text-ink">
                  EM
                </span>
                <div>
                  <p className="font-display text-base font-semibold text-ink">Eduardo Marcelo</p>
                  <button type="button" className="text-xs font-semibold text-accent">
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
              <p className="mt-1 text-sm font-semibold text-ink">72% completo</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background">
                <div className="h-full w-[72%] rounded-full bg-accent" />
              </div>
            </div>

            <nav className="mt-4 divide-y divide-border">
              {menu.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="flex w-full items-center gap-3 py-3 text-left text-sm font-medium text-ink transition-colors hover:text-accent"
                >
                  <item.icon className="h-4.5 w-4.5 text-ink-soft" strokeWidth={1.75} />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-mint px-2 py-0.5 text-[11px] font-bold text-ink">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
              <button
                type="button"
                className="flex w-full items-center gap-3 py-3 text-left text-sm font-medium text-ink transition-colors hover:text-accent"
              >
                <Sparkles className="h-4.5 w-4.5 text-ink-soft" strokeWidth={1.75} />
                Central de empregabilidade
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 py-3 text-left text-sm font-semibold text-ink-soft"
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
