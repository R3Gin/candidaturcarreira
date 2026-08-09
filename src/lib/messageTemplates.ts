/**
 * Modelos editáveis dos títulos e textos automáticos (chat e email) usados
 * nas mudanças de etapa e nas reuniões. Persistidos em localStorage e
 * sincronizados entre telas/abas por evento.
 */

export type ChatTemplateKey =
  | "etapa"
  | "aprovado"
  | "reprovado"
  | "entrevista"
  | "reuniao"
  | "cancelamento";

export type EmailTemplateKey = "novaMensagem" | "anexo" | "lembreteReuniao" | "mudancaEtapa";

export type ChatTemplate = { title: string; body: string };
export type EmailTemplate = { subject: string; body: string };

export type MessageTemplates = {
  chat: Record<ChatTemplateKey, ChatTemplate>;
  email: Record<EmailTemplateKey, EmailTemplate>;
};

const KEY = "candidatu-message-templates";
const EVENT = "candidatu-message-templates-updated";

export const defaultTemplates: MessageTemplates = {
  chat: {
    etapa: {
      title: "Atualização do processo",
      body:
        "{nome}, você avançou para a etapa \"{etapa}\" na vaga de {vaga}. Em breve enviamos os próximos detalhes por aqui.",
    },
    aprovado: {
      title: "Aprovação no processo",
      body:
        "Parabéns, {nome}! Você foi aprovada(o) no processo de {vaga}. Vamos alinhar os detalhes da contratação por este chat.",
    },
    reprovado: {
      title: "Encerramento do processo",
      body:
        "{nome}, agradecemos muito sua participação no processo de {vaga}. Nesta etapa ({etapa}) seguimos com outro perfil, mas seu currículo fica no nosso banco de talentos.",
    },
    entrevista: {
      title: "Entrevista agendada",
      body: "{nome}, sua entrevista foi agendada. {detalhe} Qualquer imprevisto, avise por aqui.",
    },
    reuniao: {
      title: "Convite de reunião",
      body:
        "{nome}, você foi convidada(o) para uma reunião do processo de {vaga}. {detalhe} Confirme sua presença por aqui.",
    },
    cancelamento: {
      title: "Alteração na reunião",
      body: "{nome}, houve uma alteração na sua reunião. {detalhe}",
    },
  },
  email: {
    novaMensagem: {
      subject: "Nova mensagem de {remetente}",
      body: "{remetente} enviou uma mensagem sobre a vaga de {vaga}:\n\n{mensagem}",
    },
    anexo: {
      subject: "Novo anexo na conversa de {vaga}",
      body: "{remetente} anexou {arquivos} à conversa da vaga de {vaga}.",
    },
    lembreteReuniao: {
      subject: "Lembrete de reunião: {titulo}",
      body: "Sua reunião começa em {minutos} minutos. {detalhe}",
    },
    mudancaEtapa: {
      subject: "Atualização do processo de {vaga}",
      body: "{nome}, seu processo mudou para a etapa \"{etapa}\". Responsável: {responsavel}.",
    },
  },
};

/** Variáveis aceitas em cada modelo, para mostrar como ajuda na tela. */
export const chatVariables: Record<ChatTemplateKey, string[]> = {
  etapa: ["{nome}", "{vaga}", "{etapa}", "{empresa}", "{responsavel}"],
  aprovado: ["{nome}", "{vaga}", "{empresa}", "{responsavel}"],
  reprovado: ["{nome}", "{vaga}", "{etapa}", "{empresa}", "{responsavel}"],
  entrevista: ["{nome}", "{vaga}", "{detalhe}", "{empresa}", "{responsavel}"],
  reuniao: ["{nome}", "{vaga}", "{detalhe}", "{empresa}", "{responsavel}"],
  cancelamento: ["{nome}", "{vaga}", "{detalhe}", "{empresa}", "{responsavel}"],
};

export const emailVariables: Record<EmailTemplateKey, string[]> = {
  novaMensagem: ["{remetente}", "{vaga}", "{mensagem}"],
  anexo: ["{remetente}", "{vaga}", "{arquivos}"],
  lembreteReuniao: ["{titulo}", "{minutos}", "{detalhe}", "{inicio}"],
  mudancaEtapa: ["{nome}", "{vaga}", "{etapa}", "{responsavel}"],
};

export const chatTemplateLabels: Record<ChatTemplateKey, string> = {
  etapa: "Avanço de etapa",
  aprovado: "Candidato aprovado",
  reprovado: "Processo encerrado",
  entrevista: "Entrevista agendada",
  reuniao: "Convite de reunião",
  cancelamento: "Reagendamento ou cancelamento",
};

export const emailTemplateLabels: Record<EmailTemplateKey, string> = {
  novaMensagem: "Email de nova mensagem",
  anexo: "Email de anexo enviado",
  lembreteReuniao: "Email de lembrete de reunião",
  mudancaEtapa: "Email de mudança de etapa",
};

export function readTemplates(): MessageTemplates {
  if (typeof window === "undefined") return defaultTemplates;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultTemplates;
    const parsed = JSON.parse(raw) as Partial<MessageTemplates>;
    return {
      chat: { ...defaultTemplates.chat, ...(parsed.chat ?? {}) },
      email: { ...defaultTemplates.email, ...(parsed.email ?? {}) },
    };
  } catch {
    return defaultTemplates;
  }
}

export function saveChatTemplate(key: ChatTemplateKey, value: ChatTemplate) {
  const current = readTemplates();
  writeAll({ ...current, chat: { ...current.chat, [key]: value } });
}

export function saveEmailTemplate(key: EmailTemplateKey, value: EmailTemplate) {
  const current = readTemplates();
  writeAll({ ...current, email: { ...current.email, [key]: value } });
}

export function resetTemplates() {
  writeAll(defaultTemplates);
}

function writeAll(next: MessageTemplates) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeTemplates(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Troca as variáveis {chave} pelos valores informados. */
export function fillTemplate(template: string, vars: Record<string, string | undefined>): string {
  return template
    .replace(/\{(\w+)\}/g, (_, name: string) => vars[name] ?? "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
