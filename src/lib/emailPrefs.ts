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
  email: string;
};

const KEY = "candidatu-email-prefs";
const EVENT = "candidatu-email-prefs-updated";

export const defaultEmailPrefs: EmailPrefs = {
  enabled: true,
  newMessages: true,
  attachments: true,
  stageUpdates: false,
  email: "",
};

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
