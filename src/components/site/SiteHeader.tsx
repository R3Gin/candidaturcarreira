import { Link } from "@tanstack/react-router";
import { ChevronRight, Menu, Phone, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

const nav = [
  { label: "Vagas", href: "#vagas" },
  { label: "Empresas", href: "#empresas" },
  { label: "Como funciona", href: "#processo" },
  { label: "Para recrutar", href: "#empregadores" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50">
      <div className="brand-gradient text-primary-foreground">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between gap-4 px-5 text-xs">
          <p className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
            Vagas verificadas com salário e etapas à vista
          </p>
          <div className="hidden items-center gap-5 sm:flex">
            <Link to="/empresa" className="font-medium hover:underline">
              Sou empresa
            </Link>
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="h-3.5 w-3.5" strokeWidth={2} />
              0800 000 2026
            </span>
          </div>
        </div>
      </div>

      <header
        className={`border-b bg-background/90 backdrop-blur-md transition-shadow duration-300 ${
          scrolled ? "border-border shadow-card" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl font-display text-base font-bold text-primary-foreground shadow-card">
              C
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Candidatu
              <span className="text-accent">.</span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative rounded-full px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-accent"
              >
                {item.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-accent transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
            <Link
              to="/freelance"
              className="group relative rounded-full px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-accent"
            >
              Freelas
              <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-accent transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          </nav>


          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/painel"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-secondary sm:inline-flex"
            >
              Entrar
            </Link>
            <Link
              to="/painel"
              className="group hidden items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.96] sm:inline-flex"
            >
              Criar perfil grátis
              <ChevronRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>

            <button
              type="button"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-secondary md:hidden"
            >
              {open ? (
                <X className="h-5 w-5" strokeWidth={1.75} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        {open && (
          <nav className="animate-fade-up border-t border-border bg-background px-5 py-3 md:hidden">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-semibold text-ink-soft"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              <Link
                to="/painel"
                className="flex-1 rounded-full border border-border py-2.5 text-center text-sm font-semibold text-ink"
              >
                Entrar
              </Link>
              <Link
                to="/painel"
                className="flex-1 rounded-full bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Criar perfil
              </Link>
            </div>
          </nav>
        )}
      </header>
    </div>
  );
}
