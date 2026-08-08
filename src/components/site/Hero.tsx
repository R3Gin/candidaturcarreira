import { MapPin, Search, ShieldCheck, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-candidate.jpg";

const atalhos = ["Atendimento", "Tecnologia", "Logística", "Saúde", "Home office"];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-sand">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-cyan/20 blur-3xl animate-float"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-float"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-14 md:pb-24 md:pt-20">
        <div>
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-ink-soft shadow-card">
            <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
            Salário e etapas visíveis em toda vaga
          </span>

          <h1
            className="animate-fade-up mt-5 font-display text-[2.5rem] leading-[1.05] font-semibold text-ink md:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Candidatura
            <br />
            sem <span className="text-accent">achismo.</span>
          </h1>

          <p
            className="animate-fade-up mt-5 max-w-md text-base leading-relaxed text-muted-foreground"
            style={{ animationDelay: "160ms" }}
          >
            No Candidatu você vê faixa salarial, nota de quem trabalha lá e em qual etapa sua
            candidatura está. Do currículo ao contrato, sem silêncio.
          </p>

          <form
            className="animate-fade-up mt-8 rounded-2xl bg-card p-2 shadow-lift transition-shadow duration-300 focus-within:shadow-lift md:flex md:items-center md:gap-1"
            style={{ animationDelay: "240ms" }}
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="flex flex-1 items-center gap-2.5 rounded-xl px-3 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <span className="sr-only">Cargo, empresa ou palavra-chave</span>
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Cargo, empresa ou palavra-chave"
              />
            </label>
            <span className="mx-3 hidden h-6 w-px bg-border md:block" />
            <label className="flex flex-1 items-center gap-2.5 rounded-xl border-t border-border px-3 py-3 md:border-t-0">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <span className="sr-only">Cidade ou remoto</span>
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Cidade ou remoto"
              />
            </label>
            <button
              type="submit"
              className="mt-1 w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.96] md:mt-0 md:w-auto"
            >
              Buscar vagas
            </button>
          </form>

          <div
            className="animate-fade-up mt-5 flex flex-wrap gap-2"
            style={{ animationDelay: "320ms" }}
          >
            {atalhos.map((item) => (
              <a
                key={item}
                href="#vagas"
                className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        <div className="animate-fade-up relative" style={{ animationDelay: "200ms" }}>
          <img
            src={heroImage}
            alt="Profissional acompanhando suas candidaturas no Candidatu"
            width={1200}
            height={1408}
            className="aspect-[4/5] w-full rounded-3xl object-cover outline outline-1 -outline-offset-1 outline-[oklch(0_0_0/0.1)]"
          />
          <div className="animate-float absolute -bottom-5 left-4 right-4 rounded-2xl bg-card p-4 shadow-lift md:left-auto md:-right-6 md:w-64">
            <p className="eyebrow">Sua candidatura</p>
            <p className="mt-2 font-display text-sm font-semibold text-ink">
              Analista de Suporte · Movva
            </p>
            <div className="mt-3 flex gap-1.5">
              <span className="animate-grow h-1.5 flex-1 rounded-full bg-primary" />
              <span
                className="animate-grow h-1.5 flex-1 rounded-full bg-primary"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="animate-grow animate-pulse-ring h-1.5 flex-1 rounded-full bg-accent"
                style={{ animationDelay: "300ms" }}
              />
              <span className="h-1.5 flex-1 rounded-full bg-secondary" />
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
              Etapa 3 de 4 · resposta em até 5 dias
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
