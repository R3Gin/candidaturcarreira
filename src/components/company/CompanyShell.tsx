import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  KanbanSquare,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useCompanyStore } from "./store";

export type CompanyView = "visao" | "pipeline" | "vagas" | "banco" | "entrevistas" | "marca";

const menu: { label: string; icon: typeof Users; view: CompanyView }[] = [
  { label: "Visão geral", icon: BarChart3, view: "visao" },
  { label: "Pipeline de seleção", icon: KanbanSquare, view: "pipeline" },
  { label: "Vagas publicadas", icon: Briefcase, view: "vagas" },
  { label: "Banco de talentos", icon: Users, view: "banco" },
  { label: "Agenda de entrevistas", icon: CalendarDays, view: "entrevistas" },
  { label: "Marca empregadora", icon: Building2, view: "marca" },
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
  const { profile, candidates, interviews } = useCompanyStore();
  const [open, setOpen] = useState(false);
  const active = candidates.filter((c) => !c.rejected && c.stage !== "Contratado").length;

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
              <p className="text-sm font-semibold leading-tight text-ink">{profile.name}</p>
              <p className="text-[11px] text-ink-soft">Painel do recrutador</p>
            </div>
            <span className="brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-full font-display text-xs font-bold text-primary-foreground">
              {profile.name.slice(0, 2).toUpperCase()}
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
            {menu.map((item) => {
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
