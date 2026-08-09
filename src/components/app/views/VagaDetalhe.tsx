import { useMemo } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Building2,
  Check,
  ClipboardList,
  Clock,
  Gift,
  Globe2,
  Heart,
  Info,
  Link2,
  Mail,
  MapPin,
  Share2,
  Star,
  Target,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { companyFromJob, jobPool, useAppStore, type Job } from "../store";
import { jobContact } from "@/lib/companyJobs";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function Bullets({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: typeof ClipboardList;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-7">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
        <Icon className="h-4.5 w-4.5 text-accent" strokeWidth={2} />
        {title}
      </h2>
      <ul className="mt-2.5 space-y-1.5">
        {items.map((i) => (
          <li key={i} className="flex gap-2 text-sm text-ink-soft">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function VagaDetalhe({
  job,
  onBack,
  onOpenJob,
  onGoToApplications,
}: {
  job: Job;
  onBack: () => void;
  onOpenJob: (jobId: string) => void;
  onGoToApplications: () => void;
}) {
  const { savedJobs, toggleSaved, followed, toggleFollow, applyToJob, hasApplied } = useAppStore();
  const company = companyFromJob(job);
  const saved = savedJobs.includes(job.id);
  const following = followed.some((c) => c.id === company.id);
  const applied = hasApplied(job.id);

  const openRoles = useMemo(() => jobPool.filter((j) => j.company === job.company), [job.company]);
  const related = useMemo(
    () => jobPool.filter((j) => j.id !== job.id).slice(0, 3),
    [job.id],
  );

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link da vaga copiado");
    } catch {
      toast("Copie o link na barra do navegador");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <article>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Voltar para a busca
        </button>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Última atualização: {job.posted}
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
          {job.role}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">{job.about}</p>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-ink-soft">
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 text-accent"
          >
            <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
            Compartilhe
          </button>
          <button
            type="button"
            onClick={() => toast("Obrigado! Nosso time vai revisar esta vaga.")}
            className="inline-flex items-center gap-1.5"
          >
            <Info className="h-3.5 w-3.5" strokeWidth={2} />
            Reportar vaga
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-ink">
            <Globe2 className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
            {job.city}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-[11px] font-bold text-ink">
            <Target className="h-3.5 w-3.5" strokeWidth={2} />
            {job.match} de match
          </span>
          {job.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-ink-soft"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
          <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
            <BadgeCheck className="h-4 w-4 text-accent" strokeWidth={2} />
            {job.salary}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" strokeWidth={1.75} />
            {job.city}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" strokeWidth={1.75} />
            Publicada {job.posted}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {applied ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-4 py-2.5 text-sm font-bold text-ink">
                <Check className="h-4 w-4" strokeWidth={2.5} />
                Candidatura enviada
              </span>
              <button
                type="button"
                onClick={onGoToApplications}
                className="text-xs font-semibold text-accent"
              >
                Acompanhar processo
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                applyToJob(job);
                toast.success(`Candidatura enviada para ${job.company}`, {
                  description: "Acompanhe cada etapa em Minhas candidaturas.",
                  action: { label: "Acompanhar", onClick: onGoToApplications },
                });
              }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.96]"
            >
              {job.quickApply ? <Zap className="h-4 w-4" strokeWidth={2} /> : null}
              {job.quickApply ? "Candidatura rápida" : "Candidatar-se"}
            </button>
          )}
          <a
            href={jobContact(job)}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink hover:bg-secondary"
          >
            <Mail className="h-4 w-4" strokeWidth={1.75} /> Contato
          </a>
          <button
            type="button"
            onClick={() => toggleSaved(job.id)}
            aria-label={saved ? "Remover das vagas salvas" : "Salvar vaga"}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-border ${
              saved ? "text-accent" : "text-ink-soft"
            }`}
          >
            <Bookmark className={`h-4.5 w-4.5 ${saved ? "fill-accent" : ""}`} strokeWidth={1.75} />
          </button>
        </div>

        <Bullets title="Responsabilidades" items={job.responsibilities} icon={ClipboardList} />
        <Bullets title="Requisitos" items={job.requirements} icon={BadgeCheck} />
        <Bullets title="Desejáveis" items={job.qualifications} icon={Star} />
        <Bullets title="Benefícios" items={job.benefits} icon={Gift} />

        <section className="mt-7">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            <Info className="h-4.5 w-4.5 text-accent" strokeWidth={2} />
            Outras informações
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Selecionamos as principais informações desta posição. A {job.company} responde as
            candidaturas do Candidatu em até 7 dias e o processo tem {4} etapas com feedback em cada
            uma delas.
          </p>
        </section>

        <div className="mt-6 rounded-2xl bg-primary p-5 text-primary-foreground">
          <p className="font-display text-lg font-bold">Boa notícia!</p>
          <p className="mt-1 text-sm opacity-90">
            Com o perfil completo no Candidatu você se candidata em um clique e acompanha cada etapa
            do processo em tempo real.
          </p>
          <button
            type="button"
            onClick={onGoToApplications}
            className="mt-3 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground"
          >
            Ver minhas candidaturas
          </button>
        </div>
      </article>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="h-16 bg-primary" />
          <div className="p-4">
            <span className="-mt-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card font-display text-base font-bold text-ink">
              {initials(job.company)}
            </span>
            <p className="mt-3 font-display text-lg font-bold text-ink">{job.company}</p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              {job.rating.toFixed(1)} no termômetro Candidatu
            </p>
            <p className="mt-2.5 text-sm text-ink-soft">
              A {job.company} atua em {job.segment.toLowerCase()}. A empresa publica faixa salarial,
              descreve as etapas do processo e mantém avaliações abertas de quem já participou.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                <Building2 className="h-3 w-3" strokeWidth={2} />
                {openRoles.length} {openRoles.length === 1 ? "vaga aberta" : "vagas abertas"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                <Link2 className="h-3 w-3" strokeWidth={2} />
                Perfil verificado
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleFollow(company)}
              className={`mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold ${
                following
                  ? "border border-accent text-accent"
                  : "bg-accent text-accent-foreground"
              }`}
            >
              <Heart className={`h-4 w-4 ${following ? "fill-accent" : ""}`} strokeWidth={2} />
              {following ? "Seguindo empresa" : "Seguir empresa"}
            </button>
          </div>
        </div>

        {openRoles.length > 1 && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <p className="font-display text-sm font-bold text-ink">
              Outras vagas na {job.company}
            </p>
            <ul className="mt-2 space-y-2">
              {openRoles
                .filter((j) => j.id !== job.id)
                .map((j) => (
                  <li key={j.id}>
                    <button
                      type="button"
                      onClick={() => onOpenJob(j.id)}
                      className="w-full rounded-xl border border-border p-3 text-left hover:border-accent"
                    >
                      <p className="font-display text-sm font-semibold text-ink">{j.role}</p>
                      <p className="text-[11px] text-ink-soft">
                        {j.city} · {j.salary}
                      </p>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <p className="font-display text-sm font-bold text-ink">Relacionadas</p>
          <ul className="mt-2 space-y-2">
            {related.map((j) => (
              <li key={j.id}>
                <button
                  type="button"
                  onClick={() => onOpenJob(j.id)}
                  className="flex w-full items-start gap-3 rounded-xl border border-border p-3 text-left hover:border-accent"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-[11px] font-bold text-ink">
                    {initials(j.company)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-sm font-semibold text-ink">
                      {j.role}
                    </span>
                    <span className="block text-[11px] text-ink-soft">
                      {j.company} · {j.posted}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      {j.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-ink-soft"
                        >
                          {t}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
