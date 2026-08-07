import { Menu } from "lucide-react";
import { useState } from "react";

const nav = [
  { label: "Vagas", href: "#vagas" },
  { label: "Empresas", href: "#empresas" },
  { label: "Como funciona", href: "#processo" },
  { label: "Para recrutar", href: "#empregadores" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-base font-bold text-primary-foreground">
            C
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Candidatu
            <span className="text-accent">.</span>
          </span>
        </a>

        <nav className="ml-auto hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-accent"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            to="/painel"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-secondary sm:inline-flex"
          >
            Entrar
          </Link>
          <Link
            to="/painel"
            className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-card transition-transform active:scale-[0.96]"
          >
            Criar perfil
          </Link>

          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-secondary md:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-5 py-3 md:hidden">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-medium text-ink-soft"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
