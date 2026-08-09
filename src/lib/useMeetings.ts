import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { readInvites, subscribeInvites, type MeetingInvite } from "./meetings";
import { queueEmail, readEmailPrefs, subscribeEmailPrefs, type EmailPrefs } from "./emailPrefs";
import type { ChatSender } from "./chat";

export function useMeetingInvites(candidateId?: string): MeetingInvite[] {
  const [invites, setInvites] = useState<MeetingInvite[]>([]);
  const sync = useCallback(() => setInvites(readInvites()), []);
  useEffect(() => {
    sync();
    return subscribeInvites(sync);
  }, [sync]);
  return candidateId ? invites.filter((i) => i.candidateId === candidateId) : invites;
}

export function useEmailPrefsLive(side: ChatSender): EmailPrefs {
  const [prefs, setPrefs] = useState<EmailPrefs>(() => readEmailPrefs(side));
  const sync = useCallback(() => setPrefs(readEmailPrefs(side)), [side]);
  useEffect(() => {
    sync();
    return subscribeEmailPrefs(sync);
  }, [sync]);
  return prefs;
}

const SENT_KEY = "candidatu-reminders-sent";

function readSent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SENT_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function markSent(key: string) {
  if (typeof window === "undefined") return;
  const next = [...readSent(), key].slice(-300);
  try {
    window.localStorage.setItem(SENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export type ReminderItem = {
  /** identificador estável do compromisso (reunião ou convite) */
  id: string;
  titulo: string;
  inicio: string;
  status: string;
  detail: string;
};

/**
 * Lembretes automáticos antes de cada reunião: toast no painel e email
 * (quando as preferências do usuário permitirem).
 */
export function useMeetingReminders(
  side: ChatSender,
  items: ReminderItem[],
  opts?: { onOpen?: () => void; fallbackEmail?: string },
) {
  const prefs = useEmailPrefsLive(side);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    const run = () => {
      const p = prefsRef.current;
      const minutes = Math.max(5, Number(p.reminderMinutes) || 60);
      const sent = readSent();
      const nowMs = Date.now();

      for (const item of itemsRef.current) {
        if (item.status !== "agendada") continue;
        const diff = new Date(item.inicio).getTime() - nowMs;
        if (diff <= 0 || diff > minutes * 60 * 1000) continue;
        const key = `${side}:${item.id}:${minutes}`;
        if (sent.includes(key)) continue;
        markSent(key);

        const faltam = Math.max(1, Math.round(diff / 60000));
        toast(`Lembrete: ${item.titulo}`, {
          description: `Começa em ${faltam} min · ${item.detail}`,
          ...(optsRef.current?.onOpen
            ? { action: { label: "Ver reunião", onClick: () => optsRef.current?.onOpen?.() } }
            : {}),
        });

        if (p.enabled && p.meetingReminders) {
          queueEmail(
            side,
            p.email || optsRef.current?.fallbackEmail || "",
            `Lembrete de reunião: ${item.titulo}`,
            `Sua reunião começa em ${faltam} minutos. ${item.detail}`,
          );
        }
      }
    };

    run();
    const t = window.setInterval(run, 60_000);
    return () => window.clearInterval(t);
  }, [side]);
}
