import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Mail, RotateCcw } from "lucide-react";
import { useCompanyStore } from "../store";
import {
  chatTemplateLabels,
  chatVariables,
  emailTemplateLabels,
  emailVariables,
  readTemplates,
  resetTemplates,
  saveChatTemplate,
  saveEmailTemplate,
  subscribeTemplates,
  type ChatTemplateKey,
  type EmailTemplateKey,
  type MessageTemplates,
} from "@/lib/messageTemplates";

const chatKeys = Object.keys(chatTemplateLabels) as ChatTemplateKey[];
const emailKeys = Object.keys(emailTemplateLabels) as EmailTemplateKey[];

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-brand-cyan";
const labelClass = "text-[11px] font-bold uppercase tracking-wide text-ink-soft";

export function Modelos() {
  const { can } = useCompanyStore();
  const canEdit = can("editar_modelos");
  const [templates, setTemplates] = useState<MessageTemplates>(() => readTemplates());
  const sync = useCallback(() => setTemplates(readTemplates()), []);

  useEffect(() => {
    sync();
    return subscribeTemplates(sync);
  }, [sync]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-cyan">
            Mensagens automáticas
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
            Modelos de chat e e-mail
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Personalize os títulos e textos enviados automaticamente ao candidato em cada mudança de
            etapa e em cada reunião. Use as variáveis para inserir os dados do processo.
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => {
              resetTemplates();
              toast.success("Modelos restaurados", {
                description: "Os textos voltaram ao padrão Candidatu.",
              });
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-ink hover:border-brand"
          >
            <RotateCcw className="h-4 w-4" /> Restaurar padrão
          </button>
        )}
      </header>

      {!canEdit && (
        <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-ink-soft">
          Seu cargo pode consultar os modelos, mas não editá-los.
        </p>
      )}

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <MessageSquare className="h-4 w-4 text-brand" /> Mensagens do chat
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {chatKeys.map((key) => (
            <ChatCard
              key={key}
              templateKey={key}
              title={templates.chat[key].title}
              body={templates.chat[key].body}
              canEdit={canEdit}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <Mail className="h-4 w-4 text-brand" /> Avisos por e-mail
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {emailKeys.map((key) => (
            <EmailCard
              key={key}
              templateKey={key}
              subject={templates.email[key].subject}
              body={templates.email[key].body}
              canEdit={canEdit}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function Variables({ list }: { list: string[] }) {
  return (
    <p className="flex flex-wrap gap-1">
      {list.map((v) => (
        <span
          key={v}
          className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-ink-soft"
        >
          {v}
        </span>
      ))}
    </p>
  );
}

function ChatCard({
  templateKey,
  title,
  body,
  canEdit,
}: {
  templateKey: ChatTemplateKey;
  title: string;
  body: string;
  canEdit: boolean;
}) {
  const [localTitle, setLocalTitle] = useState(title);
  const [localBody, setLocalBody] = useState(body);

  useEffect(() => {
    setLocalTitle(title);
    setLocalBody(body);
  }, [title, body]);

  const dirty = localTitle !== title || localBody !== body;

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <h3 className="font-display text-sm font-bold text-ink">{chatTemplateLabels[templateKey]}</h3>
      <div className="mt-3 space-y-3">
        <label className="block space-y-1">
          <span className={labelClass}>Título da mensagem</span>
          <input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            disabled={!canEdit}
            className={inputClass}
          />
        </label>
        <label className="block space-y-1">
          <span className={labelClass}>Texto</span>
          <textarea
            value={localBody}
            onChange={(e) => setLocalBody(e.target.value)}
            disabled={!canEdit}
            rows={4}
            className={inputClass}
          />
        </label>
        <Variables list={chatVariables[templateKey]} />
        {canEdit && (
          <button
            type="button"
            disabled={!dirty}
            onClick={() => {
              saveChatTemplate(templateKey, { title: localTitle, body: localBody });
              toast.success("Modelo salvo", {
                description: `${chatTemplateLabels[templateKey]} atualizado.`,
              });
            }}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Salvar modelo
          </button>
        )}
      </div>
    </article>
  );
}

function EmailCard({
  templateKey,
  subject,
  body,
  canEdit,
}: {
  templateKey: EmailTemplateKey;
  subject: string;
  body: string;
  canEdit: boolean;
}) {
  const [localSubject, setLocalSubject] = useState(subject);
  const [localBody, setLocalBody] = useState(body);

  useEffect(() => {
    setLocalSubject(subject);
    setLocalBody(body);
  }, [subject, body]);

  const dirty = localSubject !== subject || localBody !== body;

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <h3 className="font-display text-sm font-bold text-ink">{emailTemplateLabels[templateKey]}</h3>
      <div className="mt-3 space-y-3">
        <label className="block space-y-1">
          <span className={labelClass}>Assunto</span>
          <input
            value={localSubject}
            onChange={(e) => setLocalSubject(e.target.value)}
            disabled={!canEdit}
            className={inputClass}
          />
        </label>
        <label className="block space-y-1">
          <span className={labelClass}>Corpo do e-mail</span>
          <textarea
            value={localBody}
            onChange={(e) => setLocalBody(e.target.value)}
            disabled={!canEdit}
            rows={4}
            className={inputClass}
          />
        </label>
        <Variables list={emailVariables[templateKey]} />
        {canEdit && (
          <button
            type="button"
            disabled={!dirty}
            onClick={() => {
              saveEmailTemplate(templateKey, { subject: localSubject, body: localBody });
              toast.success("Modelo salvo", {
                description: `${emailTemplateLabels[templateKey]} atualizado.`,
              });
            }}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Salvar modelo
          </button>
        )}
      </div>
    </article>
  );
}
