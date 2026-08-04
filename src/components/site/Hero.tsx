import { MapPin, Search, ShieldCheck, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-candidate.jpg";

const atalhos = ["Atendimento", "Tecnologia", "Logística", "Saúde", "Home office"];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-sand">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-14 md:pb-24 md:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-ink-soft">
            <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
            Salário e etapas visíveis em toda vaga
          </span>

          <h1 className="mt-5 font-display text-[2.5rem] leading-[1.05] font-semibold md:text-6xl">
            Candidatura
            <br />
            sem achismo.
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            No Candidatu você vê faixa salarial, nota de quem trabalha lá e em qual etapa sua
            candidatura está. Do currículo ao contrato, sem silêncio.
          </p>

          <form
            className="mt-8 rounded-2xl bg-card p-2 shadow-lift md:flex md:items-center md:gap-1"
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
              className="mt-1 w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform active:scale-[0.96] md:mt-0 md:w-auto"
            >
              Buscar vagas
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {atalhos.map((item) => (
              <a
                key={item}
                href="#vagas"
                className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        <div className="relative">
          <img
            src={heroImage}
            alt="Profissional acompanhando suas candidaturas no Candidatu"
            width={1200}
            height={1408}
            className="aspect-[4/5] w-full rounded-3xl object-cover outline outline-1 -outline-offset-1 outline-[oklch(0_0_0/0.1)]"
          />
          <div className="absolute -bottom-5 left-4 right-4 rounded-2xl bg-card p-4 shadow-lift md:left-auto md:-right-6 md:w-64">
            <p className="eyebrow">Sua candidatura</p>
            <p className="mt-2 font-display text-sm font-semibold">
              Analista de Suporte · Movva
            </p>
            <div className="mt-3 flex gap-1.5">
              <span className="h-1.5 flex-1 rounded-full bg-accent" />
              <span className="h-1.5 flex-1 rounded-full bg-accent" />
              <span className="h-1.5 flex-1 rounded-full bg-mint" />
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
