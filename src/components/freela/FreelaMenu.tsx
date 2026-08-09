import {
  Award,
  Briefcase,
  LogOut,
  MessageCircle,
  PlusCircle,
  Search,
  Star,
  Trophy,
  Wallet,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { brl, computeMetrics, type FreelaAccount } from "@/lib/freelaAccount";

export type FreelaView =
  | "freelas"
  | "jobs"
  | "avaliacoes"
  | "ranking"
  | "ganhos"
  | "contatos"
  | "novo";

const menu: { label: string; icon: typeof Star; view: FreelaView; badge?: string }[] = [
  { label: "Buscar freelas", icon: Search, view: "freelas" },
  { label: "Trabalhos já feitos", icon: Briefcase, view: "jobs" },
  { label: "Avaliações das empresas", icon: Star, view: "avaliacoes" },
  { label: "Nível e ranking", icon: Trophy, view: "ranking" },
  { label: "Diárias e ganhos", icon: Wallet, view: "ganhos" },
  { label: "Contatos e chats", icon: MessageCircle, view: "contatos" },
  { label: "Registrar job", icon: PlusCircle, view: "novo", badge: "Novo" },
];

export function FreelaMenuTrigger({
  acc,
  onOpen,
}: {
  acc: FreelaAccount | null;
  onOpen: () => void;
}) {
  const initials = (acc?.nome ?? "Fr")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Abrir menu da conta de freelancer"
      className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-4 text-sm font-semibold text-ink shadow-card transition-transform duration-200 active:scale-[0.96]"
    >
      {acc?.avatar ? (
        <img src={acc.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint font-display text-xs font-bold text-ink">
          {initials}
        </span>
      )}
      Minha conta freela
    </button>
  );
}

export function FreelaMenu({
  acc,
  view,
  contatos,
  onNavigate,
  onClose,
}: {
  acc: FreelaAccount;
  view: FreelaView;
  contatos: number;
  onNavigate: (v: FreelaView) => void;
  onClose: () => void;
}) {
  const m = computeMetrics(acc);
  const initials = acc.nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />
      <aside className="relative h-full w-[min(340px,90vw)] overflow-y-auto border-l border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {acc.avatar ? (
              <img src={acc.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mint font-display text-sm font-bold text-ink">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold text-ink">{acc.nome}</p>
              <p className="truncate text-xs text-ink-soft">{acc.headline}</p>
              <button
                type="button"
                onClick={() => onNavigate("jobs")}
                className="text-xs font-semibold text-accent"
              >
                Ver histórico
              </button>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-secondary"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-secondary p-4">
          <p className="eyebrow">Nível da conta</p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {m.level.nome} · {m.level.faixa}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-accent" style={{ width: `${m.progresso}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-ink-soft">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={0} />
              {m.rating.toFixed(2)}
            </span>
            <span>{m.diarias} diárias</span>
            <span>{brl(m.ganho)}</span>
            <span className="inline-flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5 text-accent" strokeWidth={2} />#{m.posicao}
            </span>
          </div>
        </div>

        <nav className="mt-4 divide-y divide-border">
          {menu.map((item) => (
            <button
              key={item.view}
              type="button"
              onClick={() => onNavigate(item.view)}
              className={`flex w-full items-center gap-3 py-3 text-left text-sm font-medium transition-colors hover:text-accent ${
                view === item.view ? "text-accent" : "text-ink"
              }`}
            >
              <item.icon className="h-4.5 w-4.5 text-ink-soft" strokeWidth={1.75} />
              {item.label}
              {item.view === "contatos" && contatos > 0 ? (
                <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
                  {contatos}
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
          <Link
            to="/painel"
            onClick={onClose}
            className="flex w-full items-center gap-3 py-3 text-left text-sm font-medium text-ink transition-colors hover:text-accent"
          >
            <Award className="h-4.5 w-4.5 text-ink-soft" strokeWidth={1.75} />
            Painel de candidato
          </Link>
          <Link
            to="/"
            onClick={onClose}
            className="flex w-full items-center gap-3 py-3 text-left text-sm font-semibold text-ink-soft hover:text-accent"
          >
            <LogOut className="h-4.5 w-4.5" strokeWidth={1.75} />
            Sair
          </Link>
        </nav>

        <p className="mt-5 text-xs text-muted-foreground">
          Termos de uso · Aviso de privacidade do Candidatu
        </p>
      </aside>
    </div>
  );
}
