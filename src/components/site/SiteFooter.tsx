import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Mail, MapPin, Youtube } from "lucide-react";

const colunas = [
  {
    titulo: "Para candidatos",
    links: [
      { label: "Buscar vagas", href: "#vagas" },
      { label: "Avaliações de empresas", href: "#empresas" },
      { label: "Currículo com IA", href: "#processo" },
      { label: "Como funciona", href: "#processo" },
    ],
  },
  {
    titulo: "Para empresas",
    links: [
      { label: "Publicar uma vaga", href: "#empregadores" },
      { label: "Banco de talentos", href: "#empregadores" },
      { label: "Planos", href: "#empregadores" },
      { label: "Falar com o time", href: "#empregadores" },
    ],
  },
  {
    titulo: "Candidatu",
    links: [
      { label: "Sobre nós", href: "#top" },
      { label: "Privacidade", href: "#top" },
      { label: "Termos de uso", href: "#top" },
      { label: "Central de ajuda", href: "#top" },
    ],
  },
];

const social = [
  { label: "LinkedIn", icon: Linkedin },
  { label: "Instagram", icon: Instagram },
  { label: "YouTube", icon: Youtube },
];

export function SiteFooter() {
  return (
    <footer className="brand-gradient text-primary-foreground">
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(3,0.8fr)]">
          <div>
            <p className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-foreground font-display text-base font-bold text-primary">
                C
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                Candidatu<span className="text-brand-cyan">.</span>
              </span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
              Candidatura sem achismo: salário aberto, etapas visíveis e resposta com prazo
              combinado.
            </p>
            <p className="mt-5 flex items-center gap-2 text-sm text-primary-foreground/70">
              <Mail className="h-4 w-4" strokeWidth={1.75} />
              contato@candidatu.com.br
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-primary-foreground/70">
              <MapPin className="h-4 w-4" strokeWidth={1.75} />
              Joinville · SC · Brasil
            </p>
          </div>

          {colunas.map((coluna) => (
            <nav key={coluna.titulo}>
              <p className="font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground">
                {coluna.titulo}
              </p>
              <ul className="mt-4 space-y-2.5">
                {coluna.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-primary-foreground/70 transition-colors hover:text-brand-cyan"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-primary-foreground/15 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} Candidatu Tecnologia LTDA · CNPJ 00.000.000/0001-00
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {social.map(({ label, icon: Icon }) => (
                <a
                  key={label}
                  href="#top"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/20 transition-colors hover:border-brand-cyan hover:text-brand-cyan"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </a>
              ))}
            </div>
            <Link
              to="/painel"
              className="rounded-full bg-brand-cyan px-4 py-2 text-sm font-semibold text-primary transition-transform active:scale-[0.96]"
            >
              Acessar painel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
