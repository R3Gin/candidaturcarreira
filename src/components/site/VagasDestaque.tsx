import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Building2, MapPin, Zap } from "lucide-react";

import { fetchJobs } from "@/lib/db/vacancies";
import { useAuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import {
  JobFilterBar,
  emptyFilters,
  filterJobs,
  type JobFilterState,
} from "@/components/app/views/JobFilters";

const LIMIT = 15;

export function VagasDestaque() {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const { user, profile } = useAuth();
  const [filters, setFilters] = useState<JobFilterState>(emptyFilters);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["home-vagas-destaque"],
    queryFn: fetchJobs,
    staleTime: 60_000,
  });

  const list = useMemo(() => filterJobs(jobs, filters).slice(0, LIMIT), [jobs, filters]);

  const resultLabel = `${list.length} ${
    list.length === 1 ? "vaga aberta" : "vagas abertas"
  } · use a candidatura rápida para enviar seu currículo em um clique`;

  function apply() {
    if (user && (!profile || profile.account_type === "candidato")) {
      navigate({ to: "/painel" });
      return;
    }
    openAuthModal({ mode: "entrar", accountType: "candidato" });
  }

  return (
    <section id="vagas" className="bg-secondary/40 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <p className="eyebrow">Central de empregabilidade</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-4xl">
          Vagas, empresas e candidatura rápida
        </h2>

        <div className="mt-4">
          <JobFilterBar
            filters={filters}
            onChange={setFilters}
            resultLabel={resultLabel}
            jobs={jobs}
          />
        </div>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="h-52 animate-pulse rounded-2xl border border-border bg-card/70"
              />
            ))}

          {!isLoading &&
            list.map((job) => (
              <li
                key={job.id}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-card transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary font-display text-xs font-bold text-ink">
                    {job.company.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-1.5 truncate text-[11px] font-bold text-ink-soft">
                      <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {job.company}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">{job.posted}</p>
                  </div>
                </div>

                <h3 className="mt-3 font-display text-base font-bold leading-tight text-ink">
                  {job.role}
                </h3>

                <div className="mt-1.5 space-y-1 text-xs text-ink-soft">
                  <p className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {job.city}
                  </p>
                  <p className="inline-flex items-center gap-1.5 font-semibold text-ink">
                    <BadgeCheck className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                    {job.salary}
                  </p>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
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
              </li>
            ))}

          {!isLoading && list.length === 0 && (
            <li className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-ink-soft sm:col-span-2 lg:col-span-3">
              Nenhuma vaga com esses filtros.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
