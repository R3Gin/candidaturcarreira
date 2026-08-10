import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Building2, MapPin, Sparkles, Zap } from "lucide-react";

import { fetchJobs } from "@/lib/db/vacancies";
import { useAuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { Reveal } from "./Reveal";

export function VagasDestaque() {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const { user, profile } = useAuth();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["home-vagas-destaque"],
    queryFn: fetchJobs,
    staleTime: 60_000,
  });

  const destaque = jobs.slice(0, 6);

  function apply() {
    if (user && (!profile || profile.account_type === "candidato")) {
      navigate({ to: "/painel" });
      return;
    }
    openAuthModal({ mode: "entrar", accountType: "candidato" });
  }

  return (
    <section id="vagas" className="relative overflow-hidden bg-secondary/40 py-16 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="eyebrow inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                Vagas em aberto
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-4xl">
                Poucas vagas, escolhidas a dedo
              </h2>
              <p className="mt-2 text-sm text-ink-soft sm:text-base">
                Uma seleção das oportunidades mais recentes com salário aberto e resposta rápida.
                Clique em candidatar-se e entre no seu painel para enviar o currículo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal({ mode: "entrar", accountType: "candidato" })}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:bg-secondary active:scale-[0.96]"
            >
              Ver todas as vagas
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </Reveal>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="h-56 animate-pulse rounded-3xl border border-border bg-card/70"
              />
            ))}

          {!isLoading &&
            destaque.map((job, i) => (
              <Reveal key={job.id} delay={i * 80} as="li" className="h-full">
                <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-card transition-transform duration-300 hover:-translate-y-1">
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary font-display text-sm font-bold text-ink">
                      {job.company.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-1.5 truncate text-xs font-bold text-ink-soft">
                        <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {job.company}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">{job.posted}</p>
                    </div>
                  </div>

                  <h3 className="mt-3 font-display text-lg font-bold leading-tight text-ink">
                    {job.role}
                  </h3>

                  <div className="mt-2 space-y-1.5 text-xs text-ink-soft">
                    <p className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {job.city}
                    </p>
                    <p className="inline-flex items-center gap-1.5 font-semibold text-ink">
                      <BadgeCheck className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                      {job.salary}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-ink-soft"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    {job.quickApply ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent">
                        <Zap className="h-3.5 w-3.5" strokeWidth={2} />
                        Candidatura rápida
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        Processo completo
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={apply}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-transform active:scale-[0.96]"
                    >
                      Candidatar-se
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}

          {!isLoading && destaque.length === 0 && (
            <li className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-ink-soft sm:col-span-2 lg:col-span-3">
              Nenhuma vaga publicada neste momento. Crie sua conta para ser avisado assim que a
              primeira abrir.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
