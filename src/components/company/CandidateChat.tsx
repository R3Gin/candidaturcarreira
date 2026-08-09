import { useEffect, useRef, useState } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { acceptCandidate, markRead, setAutoEnabled, type ChatThread } from "@/lib/chat";
import { AttachmentList, ChatComposer, StageHistory } from "@/components/chat/ChatPieces";
import { useChatThreadByCandidate } from "@/lib/useChat";
import { useCompanyStore, type Candidate } from "./store";

const quickReplies = [
  "Podemos seguir com uma conversa inicial esta semana?",
  "Enviei o link da entrevista, confirme sua disponibilidade.",
  "Seu teste técnico está liberado, prazo de 5 dias.",
];

export function CandidateChat({ candidate }: { candidate: Candidate }) {
  const { vacancies, profile, currentMember, can } = useCompanyStore();
  const thread = useChatThreadByCandidate(candidate.id);
  const [text, setText] = useState("");
  const canTalk = can("mover_candidato") || can("agendar_entrevista");
  const role = vacancies.find((v) => v.id === candidate.vacancyId)?.role ?? "vaga";
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (thread) markRead(thread.id, "empresa");
  }, [thread?.id, thread?.messages.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [thread?.messages.length]);

  if (!thread) {
    return (
      <section className="mt-6 rounded-2xl border border-border p-4">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
          <MessageSquare className="h-3.5 w-3.5" /> Chat com o candidato
        </h3>
        <p className="mt-2 text-sm text-ink-soft">
          Aceite o currículo para abrir uma conversa direta. A partir daí o candidato recebe
          mensagens automáticas a cada mudança de etapa e pode responder por texto.
        </p>
        <button
          type="button"
          disabled={!canTalk}
          onClick={() => {
            acceptCandidate({
              candidateId: candidate.id,
              candidateName: candidate.name,
              companyName: profile.name,
              role,
              vacancyId: candidate.vacancyId,
              stage: candidate.stage,
              responsible: currentMember.name,
            });
            toast.success("Currículo aceito", { description: "Chat aberto com o candidato." });
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MessageSquare className="h-4 w-4" /> Aceitar currículo e abrir chat
        </button>
        {!canTalk && (
          <p className="mt-2 text-xs font-semibold text-ink-soft">
            Seu cargo não permite iniciar conversas com candidatos.
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
          <MessageSquare className="h-3.5 w-3.5" /> Chat com o candidato
        </h3>
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink-soft">
          <input
            type="checkbox"
            checked={thread.autoEnabled}
            onChange={(e) => setAutoEnabled(thread.id, e.target.checked)}
          />
          Mensagens automáticas de etapa
        </label>
      </div>

      <ChatMessages thread={thread} side="empresa" />
      <div ref={endRef} />

      <StageHistory thread={thread} />

      <div className="mt-3 flex flex-wrap gap-1.5">
        {quickReplies.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setText(q)}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-ink-soft hover:text-brand"
          >
            <Sparkles className="h-3 w-3" /> {q.slice(0, 32)}...
          </button>
        ))}
      </div>

      <ChatComposer
        threadId={thread.id}
        side="empresa"
        author={currentMember.name}
        placeholder="Escreva uma mensagem para o candidato..."
        value={text}
        onValueChange={setText}
      />

      <EmailNotificationPrefs side="empresa" defaultEmail={profile.hrEmail ?? ""} />
    </section>

  );
}

export function ChatMessages({
  thread,
  side,
}: {
  thread: ChatThread;
  side: "empresa" | "candidato";
}) {
  return (
    <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl bg-secondary/50 p-3">
      {thread.messages.map((m) => {
        const mine = m.from === side;
        return (
          <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-card ${
                m.kind === "auto"
                  ? "border border-brand-cyan/40 bg-card text-ink"
                  : mine
                    ? "bg-brand text-primary-foreground"
                    : "bg-card text-ink"
              }`}
            >
              {m.kind === "auto" && (
                <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-brand">
                  <Sparkles className="h-3 w-3" /> Mensagem automática
                  {m.stage ? ` · ${m.stage}` : ""}
                </p>
              )}
              {m.text && <p className="whitespace-pre-line">{m.text}</p>}
              {m.attachments && m.attachments.length > 0 && (
                <AttachmentList
                  attachments={m.attachments}
                  tone={mine && m.kind !== "auto" ? "mine" : "other"}
                />
              )}
              <p
                className={`mt-1 text-[10px] ${
                  mine && m.kind !== "auto" ? "text-primary-foreground/70" : "text-ink-soft"
                }`}
              >
                {m.author ? `${m.author} · ` : ""}
                {new Date(m.at).toLocaleString("pt-BR")}
              </p>
            </div>
          </li>
        );
      })}
      {thread.messages.length === 0 && (
        <li className="py-6 text-center text-sm text-ink-soft">Nenhuma mensagem ainda.</li>
      )}
    </ul>
  );
}
