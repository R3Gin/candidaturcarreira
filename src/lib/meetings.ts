/**
 * Convites de reunião compartilhados entre o painel da empresa e o do candidato.
 * Persistidos em localStorage e sincronizados entre telas/abas por eventos.
 */

export type Rsvp = "pendente" | "confirmado" | "recusado";

export type MeetingChange = {
  id: string;
  at: string;
  kind: "criada" | "atualizada" | "reagendada" | "cancelada" | "status" | "presenca";
  detail: string;
  by: string;
};

export type MeetingInvite = {
  /** id do convite = `${meetingId}:${candidateId}` */
  id: string;
  meetingId: string;
  candidateId: string;
  candidateName: string;
  companyName: string;
  titulo: string;
  pauta: string;
  tipo: string;
  inicio: string;
  duracaoMin: number;
  link: string;
  status: string;
  rsvp: Rsvp;
  rsvpAt?: string;
  createdAt: string;
  changes: MeetingChange[];
};

const KEY = "candidatu-meeting-invites";
const EVENT = "candidatu-meeting-invites-updated";

const uid = () => `mc-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
const now = () => new Date().toISOString();

export function readInvites(): MeetingInvite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MeetingInvite[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((i) => ({
      ...i,
      changes: i.changes ?? [],
      rsvp: i.rsvp ?? "pendente",
    }));
  } catch {
    return [];
  }
}

function writeInvites(list: MeetingInvite[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

function update(fn: (list: MeetingInvite[]) => MeetingInvite[]) {
  writeInvites(fn(readInvites()));
}

export function subscribeInvites(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function invitesOfMeeting(meetingId: string, list?: MeetingInvite[]) {
  return (list ?? readInvites()).filter((i) => i.meetingId === meetingId);
}

export function rsvpOf(meetingId: string, candidateId: string, list?: MeetingInvite[]): Rsvp {
  return (
    (list ?? readInvites()).find(
      (i) => i.meetingId === meetingId && i.candidateId === candidateId,
    )?.rsvp ?? "pendente"
  );
}

type SyncInput = {
  meetingId: string;
  titulo: string;
  pauta: string;
  tipo: string;
  inicio: string;
  duracaoMin: number;
  link: string;
  status: string;
  companyName: string;
  candidatos: { id: string; name: string }[];
  by: string;
  kind: MeetingChange["kind"];
  detail: string;
  /** zera confirmações (reagendamento) */
  resetRsvp?: boolean;
};

/** Cria/atualiza os convites de uma reunião e registra a alteração. */
export function syncMeetingInvites(input: SyncInput) {
  const ids = input.candidatos.map((c) => c.id);
  update((all) => {
    const others = all.filter((i) => i.meetingId !== input.meetingId || ids.includes(i.candidateId));
    const change: MeetingChange = {
      id: uid(),
      at: now(),
      kind: input.kind,
      detail: input.detail,
      by: input.by,
    };
    const kept = others.filter((i) => i.meetingId !== input.meetingId);
    const existing = others.filter((i) => i.meetingId === input.meetingId);

    const next = input.candidatos.map((c) => {
      const prev = existing.find((i) => i.candidateId === c.id);
      const base: MeetingInvite = {
        id: `${input.meetingId}:${c.id}`,
        meetingId: input.meetingId,
        candidateId: c.id,
        candidateName: c.name,
        companyName: input.companyName,
        titulo: input.titulo,
        pauta: input.pauta,
        tipo: input.tipo,
        inicio: input.inicio,
        duracaoMin: input.duracaoMin,
        link: input.link,
        status: input.status,
        rsvp: input.resetRsvp ? "pendente" : (prev?.rsvp ?? "pendente"),
        createdAt: prev?.createdAt ?? now(),
        changes: [...(prev?.changes ?? []), change],
      };
      if (!input.resetRsvp && prev?.rsvpAt) base.rsvpAt = prev.rsvpAt;
      return base;
    });

    return [...next, ...kept];
  });
}

export function setMeetingInvitesStatus(
  meetingId: string,
  status: string,
  by: string,
  detail: string,
) {
  update((all) =>
    all.map((i) =>
      i.meetingId === meetingId
        ? {
            ...i,
            status,
            changes: [
              ...i.changes,
              { id: uid(), at: now(), kind: "status" as const, detail, by },
            ],
          }
        : i,
    ),
  );
}

export function removeMeetingInvites(meetingId: string) {
  update((all) => all.filter((i) => i.meetingId !== meetingId));
}

/** Candidato confirma ou recusa a presença. */
export function setRsvp(inviteId: string, rsvp: Rsvp, by: string) {
  update((all) =>
    all.map((i) =>
      i.id === inviteId
        ? {
            ...i,
            rsvp,
            rsvpAt: now(),
            changes: [
              ...i.changes,
              {
                id: uid(),
                at: now(),
                kind: "presenca" as const,
                detail:
                  rsvp === "confirmado"
                    ? "Presença confirmada pelo candidato."
                    : "Candidato informou que não poderá participar.",
                by,
              },
            ],
          }
        : i,
    ),
  );
}
