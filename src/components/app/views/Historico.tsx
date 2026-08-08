import {
  Bell,
  Bookmark,
  Building2,
  FileText,
  Heart,
  History,
  Settings,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAppStore, type ActivityKind } from "../store";
import { Chip, EmptyState, PageHead } from "./ui";

const filters: { label: string; kinds: ActivityKind[] | null }[] = [
  { label: "Tudo", kinds: null },
  { label: "Candidaturas", kinds: ["candidatura", "etapa"] },
  { label: "Vagas e empresas", kinds: ["salvar", "seguir"] },
  { label: "Perfil", kinds: ["perfil", "curriculo", "preferencias"] },
  { label: "Alertas", kinds: ["alerta"] },
];

const icons: Record<ActivityKind, typeof History> = {
  candidatura: FileText,
  etapa: Sparkles,
  salvar: Bookmark,
  seguir: Heart,
  perfil: UserRound,
  curriculo: FileText,
  preferencias: Settings,
  alerta: Bell,
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Historico({ onGoToJobs }: { onGoToJobs: () => void }) {
  const { activity, clearActivity } = useAppStore();
  const [filter, setFilter] = useState("Tudo");

  const list = useMemo(() => {
    const f = filters.find((x) => x.label === filter);
    if (!f?.kinds) return activity;
    return activity.filter((a) => f.kinds!.includes(a.kind));
  }, [activity, filter]);

  return (
    <div className="space-y-5">
      <PageHead
        eyebrow="Histórico de ações"
        title="Tudo o que você fez no Candidatu"
        subtitle="Cada candidatura, avanço de etapa, vaga salva, empresa seguida e alerta recebido fica registrado aqui com data e hora."
      />

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <Chip
            key={f.label}
            label={f.label}
            active={filter === f.label}
            onClick={() => setFilter(f.label)}
          />
        ))}
        {activity.length > 0 && (
          <button
            type="button"
            onClick={clearActivity}
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Limpar histórico
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="Nenhuma ação registrada ainda"
          description="Salve uma vaga, siga uma empresa ou envie uma candidatura: as ações aparecem aqui em ordem cronológica."
          actionLabel="Ir para a central de vagas"
          onAction={onGoToJobs}
        />
      ) : (
        <ol className="rounded-2xl border border-border bg-card p-5 shadow-card">
          {list.map((a, i) => {
            const Icon = icons[a.kind] ?? History;
            return (
              <li key={a.id} className="relative flex gap-4 pb-5 last:pb-0">
                {i < list.length - 1 && (
                  <span className="absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-px bg-border" />
                )}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-ink">
                  <Icon className="h-4 w-4 text-accent" strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{a.title}</p>
                  <p className="text-xs text-ink-soft">{a.detail}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(a.at)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="rounded-2xl bg-secondary p-4 text-sm text-ink-soft">
        <p className="inline-flex items-center gap-2 font-semibold text-ink">
          <Building2 className="h-4 w-4 text-accent" strokeWidth={2} />
          Por que isso importa
        </p>
        <p className="mt-1">
          O histórico alimenta as recomendações inteligentes: quanto mais você interage, mais
          precisos ficam os alertas de vagas compatíveis.
        </p>
      </div>
    </div>
  );
}
