import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  readThreads,
  subscribeThreads,
  totalUnread,
  type ChatSender,
  type ChatThread,
} from "./chat";
import { queueEmail, readEmailPrefs } from "./emailPrefs";
import { fillTemplate, readTemplates } from "./messageTemplates";

export function useChatThreads(): ChatThread[] {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const sync = useCallback(() => setThreads(readThreads()), []);

  useEffect(() => {
    sync();
    return subscribeThreads(sync);
  }, [sync]);

  return threads;
}

export function useChatThreadByCandidate(candidateId: string): ChatThread | null {
  const threads = useChatThreads();
  return threads.find((t) => t.candidateId === candidateId) ?? null;
}

/** Total de mensagens não lidas do lado informado (badges de cabeçalho/menu). */
export function useChatUnread(side: ChatSender): number {
  const threads = useChatThreads();
  return totalUnread(side, threads);
}

/**
 * Avisa em tela (toast) quando chegar uma mensagem nova do outro lado do chat.
 * Ignora o primeiro carregamento para não notificar histórico antigo.
 */
export function useChatMessageNotifications(
  side: ChatSender,
  opts?: { onOpen?: (threadId: string) => void; enabled?: boolean; fallbackEmail?: string },
) {
  const threads = useChatThreads();
  const seen = useRef<Map<string, string> | null>(null);
  const enabled = opts?.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;
    const lastByThread = new Map<string, string>();
    for (const t of threads) lastByThread.set(t.id, t.messages.at(-1)?.id ?? "");

    if (seen.current === null) {
      seen.current = lastByThread;
      return;
    }

    for (const t of threads) {
      const last = t.messages.at(-1);
      if (!last) continue;
      if (seen.current.get(t.id) === last.id) continue;
      if (last.from === side) continue;
      const who = side === "empresa" ? t.candidateName : t.companyName;
      const files = last.attachments?.length ?? 0;
      const preview = last.text
        ? last.text.slice(0, 90)
        : `${files} anexo${files > 1 ? "s" : ""} recebido${files > 1 ? "s" : ""}`;
      toast(`Nova mensagem de ${who}`, {
        description: preview,
        ...(opts?.onOpen
          ? { action: { label: "Abrir chat", onClick: () => opts.onOpen?.(t.id) } }
          : {}),
      });

      const prefs = readEmailPrefs(side);
      const to = prefs.email || opts?.fallbackEmail || "";
      if (prefs.enabled && to) {
        const templates = readTemplates().email;
        if (files > 0 && prefs.attachments) {
          const vars = {
            remetente: who,
            vaga: t.role,
            arquivos: `${files} arquivo${files > 1 ? "s" : ""}`,
          };
          queueEmail(
            side,
            to,
            fillTemplate(templates.anexo.subject, vars),
            fillTemplate(templates.anexo.body, vars),
          );
        } else if (files === 0 && prefs.newMessages) {
          const vars = { remetente: who, vaga: t.role, mensagem: last.text };
          queueEmail(
            side,
            to,
            fillTemplate(templates.novaMensagem.subject, vars),
            fillTemplate(templates.novaMensagem.body, vars),
          );
        }
      }
    }
    seen.current = lastByThread;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threads, side, enabled]);
}
