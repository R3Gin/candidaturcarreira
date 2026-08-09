/**
 * Preferências de notificação por email do chat (candidato e empresa).
 * Persistidas em localStorage e sincronizadas entre telas/abas.
 */
import type { ChatSender } from "./chat";

export type EmailPrefs = {
  enabled: boolean;
  newMessages: boolean;
  attachments: boolean;
  stageUpdates: boolean;
  /** lembretes automáticos antes de cada reunião */
  meetingReminders: boolean;
  /** antecedência do lembrete, em minutos */
  reminderMinutes: number;
  email: string;
};

const KEY = "candidatu-email-prefs";
const EVENT = "candidatu-email-prefs-updated";
const OUTBOX_KEY = "candidatu-email-outbox";

export const defaultEmailPrefs: EmailPrefs = {
  enabled: true,
  newMessages: true,
  attachments: true,
  stageUpdates: false,
  meetingReminders: true,
  reminderMinutes: 60,
  email: "",
};

export type SentEmail = {
  id: string;
  side: ChatSender;
  to: string;
  subject: string;
  body: string;
  at: string;
};

/**
 * Registra o email de aviso no "outbox" do projeto. Enquanto o domínio de envio
 * não estiver configurado, os avisos ficam registrados aqui e aparecem no painel.
 */
export function queueEmail(side: ChatSender, to: string, subject: string, body: string) {
  if (typeof window === "undefined" || !to) return;
  try {
    const raw = window.localStorage.getItem(OUTBOX_KEY);
    const list = raw ? (JSON.parse(raw) as SentEmail[]) : [];
    const next: SentEmail[] = [
      {
        id: `e-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
        side,
        to,
        subject,
        body,
        at: new Date().toISOString(),
      },
      ...(Array.isArray(list) ? list : []),
    ].slice(0, 50);
    window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function readEmailOutbox(side?: ChatSender): SentEmail[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(OUTBOX_KEY);
    const list = raw ? (JSON.parse(raw) as SentEmail[]) : [];
    if (!Array.isArray(list)) return [];
    return side ? list.filter((e) => e.side === side) : list;
  } catch {
    return [];
  }
}

type Store = Partial<Record<ChatSender, EmailPrefs>>;

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function readEmailPrefs(side: ChatSender): EmailPrefs {
  return { ...defaultEmailPrefs, ...(readStore()[side] ?? {}) };
}

export function saveEmailPrefs(side: ChatSender, prefs: Partial<EmailPrefs>) {
  if (typeof window === "undefined") return;
  const next: Store = { ...readStore(), [side]: { ...readEmailPrefs(side), ...prefs } };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeEmailPrefs(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
