import { CalendarDays, Trash2, Video } from "lucide-react";
import { initials, useCompanyStore } from "../store";

export function Entrevistas() {
  const { interviews, candidates, vacancies, cancelInterview, can } = useCompanyStore();
  const canManage = can("agendar_entrevista");
  const sorted = [...interviews].sort((a, b) =>
    `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
  );

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Agenda de entrevistas</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          {sorted.length} entrevistas na fila
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Agende novas entrevistas pelo perfil da pessoa candidata, no pipeline ou no banco de
          talentos.
        </p>
      </header>

      <ul className="space-y-3">
        {sorted.map((i) => {
          const c = candidates.find((x) => x.id === i.candidateId);
          const v = vacancies.find((x) => x.id === i.vacancyId);
          return (
            <li
              key={i.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
            >
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl brand-gradient text-primary-foreground">
                <span className="text-[10px] font-bold uppercase">
                  {new Date(`${i.date}T00:00:00`).toLocaleDateString("pt-BR", { month: "short" })}
                </span>
                <span className="font-display text-lg font-bold leading-none">
                  {i.date.slice(-2)}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-semibold text-ink">
                  {i.kind} · {i.time}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${c?.avatarTone ?? "bg-brand"} text-[9px] font-bold text-primary-foreground`}
                    >
                      {initials(c?.name ?? "?")}
                    </span>
                    {c?.name ?? "Candidato removido"}
                  </span>
                  <span>· {v?.role ?? "Vaga removida"}</span>
                  <span>· com {i.interviewer}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-ink">
                  <Video className="h-3.5 w-3.5" /> {i.link}
                </span>
                {canManage && (
                  <button
                    type="button"
                    aria-label="Cancelar entrevista"
                    onClick={() => cancelInterview(i.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
        {sorted.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-ink-soft">
            <CalendarDays className="mx-auto mb-2 h-6 w-6 text-brand-cyan" />
            Nenhuma entrevista agendada.
          </li>
        )}
      </ul>
    </div>
  );
}
