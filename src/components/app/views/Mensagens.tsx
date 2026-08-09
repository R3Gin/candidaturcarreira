import { useEffect, useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { ChatMessages } from "@/components/company/CandidateChat";
import { markRead } from "@/lib/chat";
import { ChatComposer, StageHistory } from "@/components/chat/ChatPieces";
import { useAppStore } from "@/components/app/store";
import { useChatThreads } from "@/lib/useChat";

export function Mensagens({ onGoToJobs }: { onGoToJobs: () => void }) {
  const threads = useChatThreads();
  const { account } = useAppStore();
  const ordered = useMemo(
    () =>
      [...threads].sort(
        (a, b) =>
          new Date(b.messages.at(-1)?.at ?? b.createdAt).getTime() -
          new Date(a.messages.at(-1)?.at ?? a.createdAt).getTime(),
      ),
    [threads],
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = ordered.find((t) => t.id === activeId) ?? ordered[0] ?? null;
  const [text, setText] = useState("");

  useEffect(() => {
    if (active) markRead(active.id, "candidato");
  }, [active?.id, active?.messages.length]);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-brand">Mensagens</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          Conversas com as empresas
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Quando uma empresa aceita seu currículo, o chat é aberto aqui. Você recebe avisos
          automáticos de cada etapa do processo e pode responder por mensagem.
        </p>
      </header>

      {ordered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <MessageSquare className="mx-auto h-6 w-6 text-ink-soft" />
          <p className="mt-3 text-sm text-ink-soft">
            Nenhuma conversa aberta ainda. Candidate-se às vagas e, ao aceitarem seu currículo, a
            empresa fala com você por aqui.
          </p>
          <button
            type="button"
            onClick={onGoToJobs}
            className="mt-4 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Ver vagas
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <ul className="space-y-2">
            {ordered.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className={`w-full rounded-2xl border p-3 text-left shadow-card ${
                    active?.id === t.id ? "border-brand bg-card" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-display text-sm font-bold text-ink">
                      {t.companyName}
                    </p>
                    {t.unreadForCandidate > 0 && (
                      <span className="rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
                        {t.unreadForCandidate}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-ink-soft">{t.role}</p>
                  <p className="mt-1 text-[11px] font-semibold text-brand">Etapa: {t.stage}</p>
                </button>
              </li>
            ))}
          </ul>

          {active && (
            <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">{active.companyName}</h2>
                  <p className="text-xs text-ink-soft">
                    {active.role} · etapa atual {active.stage} · {active.status}
                  </p>
                </div>
                <span className="rounded-full bg-mint px-3 py-1 text-[11px] font-bold text-ink">
                  Currículo aceito
                </span>
              </div>

              <ChatMessages thread={active} side="candidato" />

              <StageHistory thread={active} />

              <ChatComposer
                threadId={active.id}
                side="candidato"
                author={account.name}
                placeholder="Escreva para a empresa..."
                value={text}
                onValueChange={setText}
              />

              <EmailNotificationPrefs side="candidato" defaultEmail={account.email} />
            </section>

          )}
        </div>
      )}
    </div>
  );
}
