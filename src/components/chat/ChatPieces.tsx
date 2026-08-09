import { useRef, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  MoveRight,
  Paperclip,
  Send,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  fileToAttachment,
  formatBytes,
  sendMessage,
  type ChatAttachment,
  type ChatSender,
  type ChatThread,
  type StageEvent,
} from "@/lib/chat";

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Lista de anexos de uma mensagem, com download. */
export function AttachmentList({
  attachments,
  tone,
}: {
  attachments: ChatAttachment[];
  tone: "mine" | "other";
}) {
  return (
    <ul className="mt-2 space-y-1.5">
      {attachments.map((a) => (
        <li key={a.id}>
          <a
            href={a.dataUrl}
            download={a.name}
            className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors ${
              tone === "mine"
                ? "bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25"
                : "bg-secondary text-ink hover:bg-secondary/70"
            }`}
          >
            <FileText className="h-4 w-4 shrink-0" strokeWidth={1.9} />
            <span className="min-w-0 flex-1 truncate">{a.name}</span>
            <span className="shrink-0 opacity-70">{formatBytes(a.size)}</span>
            <Download className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Campo de mensagem com suporte a anexos (documentos da candidatura). */
export function ChatComposer({
  threadId,
  side,
  author,
  placeholder,
  value,
  onValueChange,
  disabled,
}: {
  threadId: string;
  side: ChatSender;
  author?: string;
  placeholder: string;
  value?: string;
  onValueChange?: (v: string) => void;
  disabled?: boolean;
}) {
  const [inner, setInner] = useState("");
  const text = value ?? inner;
  const setText = onValueChange ?? setInner;
  const [files, setFiles] = useState<ChatAttachment[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pick = async (list: FileList | null) => {
    if (!list) return;
    for (const file of Array.from(list)) {
      try {
        const att = await fileToAttachment(file);
        setFiles((f) => [...f, att]);
      } catch (e) {
        toast.error("Anexo não enviado", {
          description: e instanceof Error ? e.message : "Tente outro arquivo.",
        });
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim() && files.length === 0) return;
        sendMessage(threadId, side, text, {
          ...(author ? { author } : {}),
          ...(files.length ? { attachments: files } : {}),
        });
        setText("");
        setFiles([]);
      }}
    >
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {files.map((f) => (
            <li
              key={f.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-ink"
            >
              <FileText className="h-3 w-3" strokeWidth={2} />
              <span className="max-w-[160px] truncate">{f.name}</span>
              <span className="text-ink-soft">{formatBytes(f.size)}</span>
              <button
                type="button"
                aria-label={`Remover ${f.name}`}
                onClick={() => setFiles((all) => all.filter((x) => x.id !== f.id))}
                className="text-ink-soft hover:text-destructive"
              >
                <X className="h-3 w-3" strokeWidth={2.5} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => void pick(e.target.files)}
        />
        <button
          type="button"
          aria-label="Anexar documento"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-ink-soft transition-colors hover:bg-secondary hover:text-brand disabled:opacity-50"
        >
          <Paperclip className="h-4 w-4" strokeWidth={1.9} />
        </button>
        <input
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-brand-cyan"
        />
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Send className="h-4 w-4" /> Enviar
        </button>
      </div>
      <p className="text-[11px] text-ink-soft">
        Anexe currículo, portfólio ou documentos da candidatura (até 2 MB cada).
      </p>
    </form>
  );
}

const stageIcon: Record<StageEvent["kind"], typeof MoveRight> = {
  abertura: Sparkles,
  etapa: MoveRight,
  aprovado: CheckCircle2,
  reprovado: XCircle,
  entrevista: CalendarDays,
};

/** Histórico detalhado das mudanças de etapa dentro do chat. */
export function StageHistory({ thread }: { thread: ChatThread }) {
  const [open, setOpen] = useState(false);
  const history = [...(thread.stageHistory ?? [])].reverse();

  return (
    <section className="mt-3 rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left"
      >
        <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
          Histórico de etapas · {history.length}
        </span>
        <span className="text-xs font-semibold text-brand">{open ? "Ocultar" : "Ver detalhes"}</span>
      </button>

      {open && (
        <ol className="space-y-3 border-t border-border px-3.5 py-3">
          {history.map((h) => {
            const Icon = stageIcon[h.kind];
            return (
              <li key={h.id} className="flex gap-3">
                <Icon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    h.kind === "reprovado"
                      ? "text-destructive"
                      : h.kind === "aprovado"
                        ? "text-brand-cyan"
                        : "text-brand"
                  }`}
                  strokeWidth={2}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight text-ink">{h.stage}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-ink-soft">
                    Status: {h.status} · por {h.by}
                  </p>
                  {h.detail && <p className="mt-0.5 text-xs text-ink-soft">{h.detail}</p>}
                  <p className="mt-0.5 text-[11px] text-ink-soft">{dateTime(h.at)}</p>
                </div>
              </li>
            );
          })}
          {history.length === 0 && (
            <li className="py-2 text-center text-xs text-ink-soft">
              Nenhuma mudança de etapa registrada ainda.
            </li>
          )}
        </ol>
      )}
    </section>
  );
}
