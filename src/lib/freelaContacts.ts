/**
 * Solicitações de contato enviadas pelos candidatos nos freelas.
 * Cada solicitação abre um chat com a empresa (mesmo motor de chat do painel)
 * e fica registrada no painel da página de Freelas.
 */

import { acceptCandidate, findThreadByCandidate, sendMessage } from "./chat";

export type FreelaContact = {
  id: string;
  freelaId: string;
  cargo: string;
  empresa: string;
  nome: string;
  contato: string;
  mensagem: string;
  diaria: number;
  at: string;
  threadId: string;
};

const KEY = "candidatu-freela-contatos";
const EVENT = "candidatu-freela-contatos-updated";
const APP_KEY = "candidatu-app-state";

export function readFreelaContacts(): FreelaContact[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as FreelaContact[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFreelaContacts(list: FreelaContact[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeFreelaContacts(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Nome e e-mail já salvos no perfil do candidato, quando existirem. */
export function candidateDefaults(): { nome: string; contato: string } {
  if (typeof window === "undefined") return { nome: "", contato: "" };
  try {
    const raw = window.localStorage.getItem(APP_KEY);
    if (!raw) return { nome: "", contato: "" };
    const parsed = JSON.parse(raw) as { profile?: { name?: string; email?: string } };
    return {
      nome: parsed.profile?.name ?? "",
      contato: parsed.profile?.email ?? "",
    };
  } catch {
    return { nome: "", contato: "" };
  }
}

export function contactForFreela(freelaId: string) {
  return readFreelaContacts().find((c) => c.freelaId === freelaId) ?? null;
}

/**
 * Envia a solicitação para a empresa, abre o chat e registra no painel de freelas.
 * Retorna o id da conversa criada.
 */
export function requestFreelaContact(input: {
  freelaId: string;
  cargo: string;
  empresa: string;
  diaria: number;
  nome: string;
  contato: string;
  mensagem: string;
}) {
  const candidateId = `freela-${input.freelaId}`;
  const existing = contactForFreela(input.freelaId);
  if (existing) return existing.threadId;

  const threadId =
    findThreadByCandidate(candidateId)?.id ??
    acceptCandidate({
      candidateId,
      candidateName: input.nome,
      companyName: input.empresa,
      role: input.cargo,
      vacancyId: input.freelaId,
      stage: "Solicitação de contato",
      responsible: "Freelas Candidatu",
    });

  const mensagem =
    input.mensagem.trim() ||
    `Olá! Tenho interesse no freela de ${input.cargo}. Estou disponível para a data e a carga horária informadas.`;

  sendMessage(threadId, "candidato", `${mensagem}\n\nContato: ${input.contato}`, {
    author: input.nome,
    stage: "Solicitação de contato",
  });

  const record: FreelaContact = {
    id: `fc-${Date.now()}`,
    freelaId: input.freelaId,
    cargo: input.cargo,
    empresa: input.empresa,
    nome: input.nome,
    contato: input.contato,
    mensagem,
    diaria: input.diaria,
    at: new Date().toISOString(),
    threadId,
  };
  writeFreelaContacts([record, ...readFreelaContacts()]);
  return threadId;
}

export function removeFreelaContact(id: string) {
  writeFreelaContacts(readFreelaContacts().filter((c) => c.id !== id));
}
