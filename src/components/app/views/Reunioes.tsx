import { useState } from "react";
import {
  CalendarClock,
  CalendarX,
  CheckCircle2,
  Clock,
  Copy,
  Video,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { findThreadByCandidate, recordStageEvent, sendMessage } from "@/lib/chat";
import { formatWhen, setRsvp, type MeetingInvite } from "@/lib/meetings";
import { useMeetingInvites, useMeetingReminders } from "@/lib/useMeetings";
import { EmailNotificationPrefs } from "@/components/chat/EmailNotificationPrefs";
import { useAppStore } from "../store";

const statusTone: Record<string, string> = {
  agendada: "bg-mint text-ink",
  realizada: "bg-secondary text-ink-soft",
  cancelada: "bg-destructive/10 text-destructive",
};

const rsvpTone: Record<string, string> = {
  confirmado: "bg-mint text-ink",
  recusado: "bg-destructive/10 text-destructive",
  pendente: "bg-secondary text-ink-soft",
};

const rsvpLabel: Record<string, string> = {
  confirmado: "Presença confirmada",
  recusado: "Você recusou o convite",
  pendente: "Confirmação pendente",
};

export function Reunioes({ onGoToMessages }: { onGoToMessages: () => void }) {
  const { account } = useAppStore();
  const invites = useMeetingInvites();

  useMeetingReminders(
    "candidato",
    invites.map((i) => ({
      id: i.id,
      titulo: i.titulo,
      inicio: i.inicio,
      status: i.status,
      detail: `${i.companyName}${i.link ? ` · ${i.link}` : ""}`,
    })),
    { fallbackEmail: account.email, onOpen: onGoToMessages },
  );

  const ordered = [...invites].sort((a, b) => a.inicio.localeCompare(b.inicio));
  const pendentes = ordered.filter((i) => i.status === "agendada" && i.rsvp === "pendente").length;

  const responder = (invite: MeetingInvite, rsvp: "confirmado" | "recusado") => {
    setRsvp(invite.id, rsvp, account.name);
    const thread = findThreadByCandidate(invite.candidateId);
    const texto =
      rsvp === "confirmado"
        ? `Confirmo minha presença na reunião "${invite.titulo}" em ${formatWhen(invite.inicio)}.`
        : `Infelizmente não poderei participar da reunião "${invite.titulo}" em ${formatWhen(invite.inicio)}. Podemos remarcar?`;
    if (thread) {
      sendMessage(thread.id, "candidato", texto, { author: account.name });
      recordStageEvent(invite.candidateId, {
        kind: rsvp === "confirmado" ? "presenca" : "cancelamento",
        by: account.name,
        detail:
          rsvp === "confirmado"
            ? `Presença confirmada na reunião "${invite.titulo}" (${formatWhen(invite.inicio)}).`
            : `Convite recusado para a reunião "${invite.titulo}" (${formatWhen(invite.inicio)}).`,
      });
    }
    toast.success(
      rsvp === "confirmado" ? "Presença confirmada!" : "Resposta enviada à empresa.",
      { description: "A empresa foi avisada pelo chat." },
    );
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Reuniões</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          {pendentes > 0
            ? `${pendentes} convite(s) aguardando sua confirmação`
            : "Suas reuniões com as empresas"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Confirme presença, acompanhe reagendamentos e receba lembretes antes de cada conversa.
        </p>
      </header>

      <div className="space-y-4">
        {ordered.map((i) => (
          <article key={i.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-display text-base font-bold text-ink">{i.titulo}</h2>
                <p className="mt-1 text-xs font-semibold text-brand">{i.companyName}</p>
                <p className="mt-1 inline-flex items-center gap-2 text-xs text-ink-soft">
                  <CalendarClock className="h-3.5 w-3.5" /> {formatWhen(i.inicio)} · {i.duracaoMin}{" "}
                  min
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone[i.status] ?? "bg-secondary text-ink-soft"}`}
                >
                  {i.status === "agendada"
                    ? "Agendada"
                    : i.status === "realizada"
                      ? "Realizada"
                      : "Cancelada"}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${rsvpTone[i.rsvp]}`}
                >
                  {rsvpLabel[i.rsvp]}
                </span>
              </div>
            </div>

            {i.pauta && <p className="mt-3 text-sm text-ink-soft">{i.pauta}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-ink">
                <Video className="h-3.5 w-3.5" />
                {i.tipo === "presencial" ? "Presencial" : i.tipo === "audio" ? "Áudio" : "Vídeo"}
              </span>
              {i.link && (
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(i.link);
                    toast.success("Link copiado!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-brand hover:bg-secondary"
                >
                  <Copy className="h-3.5 w-3.5" /> Copiar link
                </button>
              )}
              <button
                type="button"
                onClick={onGoToMessages}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-secondary hover:text-ink"
              >
                Abrir conversa
              </button>
            </div>

            {i.status === "agendada" && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => responder(i, "confirmado")}
                  disabled={i.rsvp === "confirmado"}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> Confirmar presença
                </button>
                <button
                  type="button"
                  onClick={() => responder(i, "recusado")}
                  disabled={i.rsvp === "recusado"}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" /> Não poderei participar
                </button>
                {i.rsvpAt && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
                    <Clock className="h-3.5 w-3.5" /> Respondido em {formatWhen(i.rsvpAt)}
                  </span>
                )}
              </div>
            )}

            <Alteracoes invite={i} />
          </article>
        ))}

        {ordered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-ink-soft">
            <Video className="mx-auto mb-2 h-6 w-6 text-brand-cyan" />
            Você ainda não tem reuniões agendadas. Assim que uma empresa marcar, o convite aparece
            aqui para você confirmar presença.
          </p>
        )}
      </div>

      <EmailNotificationPrefs side="candidato" defaultEmail={account.email} />
    </div>
  );
}

function Alteracoes({ invite }: { invite: MeetingInvite }) {
  const [open, setOpen] = useState(false);
  const changes = [...invite.changes].reverse();
  if (changes.length === 0) return null;

  return (
    <div className="mt-3 rounded-2xl border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
          <CalendarX className="h-3.5 w-3.5" /> Histórico da reunião · {changes.length}
        </span>
        <span className="text-[11px] font-semibold text-brand">{open ? "Ocultar" : "Ver"}</span>
      </button>
      {open && (
        <ol className="space-y-2 border-t border-border px-3 py-2">
          {changes.map((c) => (
            <li key={c.id} className="text-xs text-ink-soft">
              <span className="font-semibold text-ink">{c.detail}</span>
              <br />
              por {c.by} · {formatWhen(c.at)}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
