import { useCallback, useEffect, useState } from "react";
import { Mail } from "lucide-react";
import type { ChatSender } from "@/lib/chat";
import {
  readEmailPrefs,
  saveEmailPrefs,
  subscribeEmailPrefs,
  type EmailPrefs,
} from "@/lib/emailPrefs";

export function useEmailPrefs(side: ChatSender): EmailPrefs {
  const [prefs, setPrefs] = useState<EmailPrefs>(() => readEmailPrefs(side));
  const sync = useCallback(() => setPrefs(readEmailPrefs(side)), [side]);
  useEffect(() => {
    sync();
    return subscribeEmailPrefs(sync);
  }, [sync]);
  return prefs;
}

const rows: { key: keyof EmailPrefs; label: string; hint: string }[] = [
  {
    key: "newMessages",
    label: "Novas mensagens no chat",
    hint: "Aviso por email quando o outro lado responder.",
  },
  {
    key: "attachments",
    label: "Anexos enviados",
    hint: "Aviso quando um documento for anexado à conversa.",
  },
  {
    key: "stageUpdates",
    label: "Mudanças de etapa",
    hint: "Resumo por email a cada atualização do processo.",
  },
];

export function EmailNotificationPrefs({
  side,
  defaultEmail,
}: {
  side: ChatSender;
  defaultEmail?: string;
}) {
  const prefs = useEmailPrefs(side);
  const email = prefs.email || defaultEmail || "";

  return (
    <section className="mt-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
          <Mail className="h-3.5 w-3.5" /> Notificações por email
        </h3>
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink-soft">
          <input
            type="checkbox"
            checked={prefs.enabled}
            onChange={(e) => saveEmailPrefs(side, { enabled: e.target.checked })}
          />
          Ativar envio de emails
        </label>
      </div>

      <label className="mt-3 block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
          Email para receber os avisos
        </span>
        <input
          type="email"
          value={email}
          disabled={!prefs.enabled}
          placeholder="nome@empresa.com"
          onChange={(e) => saveEmailPrefs(side, { email: e.target.value })}
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-brand disabled:opacity-50"
        />
      </label>

      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.key} className="flex items-start gap-2">
            <input
              id={`${side}-${row.key}`}
              type="checkbox"
              disabled={!prefs.enabled}
              checked={Boolean(prefs[row.key])}
              onChange={(e) => saveEmailPrefs(side, { [row.key]: e.target.checked })}
              className="mt-1"
            />
            <label htmlFor={`${side}-${row.key}`} className="min-w-0">
              <span className="block text-sm font-semibold text-ink">{row.label}</span>
              <span className="block text-xs text-ink-soft">{row.hint}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
