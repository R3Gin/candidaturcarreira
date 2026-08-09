/**
 * Chat compartilhado entre o painel da empresa e o painel do candidato.
 * Persistido em localStorage e sincronizado entre abas/telas por eventos.
 */

export type ChatSender = "empresa" | "candidato";

export type ChatAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
};

export type ChatMessage = {
  id: string;
  from: ChatSender;
  kind: "auto" | "texto";
  text: string;
  at: string;
  author?: string;
  stage?: string;
  attachments?: ChatAttachment[];
};

export type StageEvent = {
  id: string;
  at: string;
  stage: string;
  status: string;
  by: string;
  kind: "abertura" | "etapa" | "aprovado" | "reprovado" | "entrevista";
  detail?: string;
};

export type ChatThread = {
  id: string;
  candidateId: string;
  candidateName: string;
  companyName: string;
  role: string;
  vacancyId?: string;
  createdAt: string;
  acceptedAt: string;
  stage: string;
  status: "Em andamento" | "Contratado" | "Encerrado";
  autoEnabled: boolean;
  messages: ChatMessage[];
  stageHistory: StageEvent[];
  unreadForCompany: number;
  unreadForCandidate: number;
};

const KEY = "candidatu-chats";
const EVENT = "candidatu-chats-updated";

const uid = () => `m-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
const now = () => new Date().toISOString();

export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

export function fileToAttachment(file: File): Promise<ChatAttachment> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      reject(new Error("Arquivo maior que 2 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.onload = () =>
      resolve({
        id: uid(),
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        dataUrl: String(reader.result ?? ""),
      });
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}


export function readThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatThread[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeThreads(threads: ChatThread[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(threads));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeThreads(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function update(fn: (threads: ChatThread[]) => ChatThread[]) {
  writeThreads(fn(readThreads()));
}

export function findThreadByCandidate(candidateId: string) {
  return readThreads().find((t) => t.candidateId === candidateId) ?? null;
}

export function acceptCandidate(input: {
  candidateId: string;
  candidateName: string;
  companyName: string;
  role: string;
  vacancyId?: string;
  stage: string;
  responsible?: string;
}) {
  const existing = findThreadByCandidate(input.candidateId);
  if (existing) return existing.id;
  const id = `t-${input.candidateId}`;
  const thread: ChatThread = {
    id,
    candidateId: input.candidateId,
    candidateName: input.candidateName,
    companyName: input.companyName,
    role: input.role,
    ...(input.vacancyId ? { vacancyId: input.vacancyId } : {}),
    createdAt: now(),
    acceptedAt: now(),
    stage: input.stage,
    status: "Em andamento",
    autoEnabled: true,
    unreadForCompany: 0,
    unreadForCandidate: 1,
    messages: [
      {
        id: uid(),
        from: "empresa",
        kind: "auto",
        text: `Olá, ${input.candidateName.split(" ")[0]}! Seu currículo foi analisado e aprovado para a vaga de ${input.role} na ${input.companyName}. A partir de agora, vamos conversar por aqui e avisar cada etapa do processo.`,
        at: now(),
        author: input.responsible ?? "Equipe de recrutamento",
        stage: input.stage,
      },
    ],
  };
  update((all) => [thread, ...all]);
  return id;
}

export function sendMessage(
  threadId: string,
  from: ChatSender,
  text: string,
  opts?: { kind?: ChatMessage["kind"]; author?: string; stage?: string },
) {
  const clean = text.trim();
  if (!clean) return;
  update((all) =>
    all.map((t) =>
      t.id === threadId
        ? {
            ...t,
            messages: [
              ...t.messages,
              {
                id: uid(),
                from,
                kind: opts?.kind ?? "texto",
                text: clean,
                at: now(),
                ...(opts?.author ? { author: opts.author } : {}),
                ...(opts?.stage ? { stage: opts.stage } : {}),
              },
            ],
            unreadForCandidate:
              from === "empresa" ? t.unreadForCandidate + 1 : t.unreadForCandidate,
            unreadForCompany: from === "candidato" ? t.unreadForCompany + 1 : t.unreadForCompany,
          }
        : t,
    ),
  );
}

export function markRead(threadId: string, side: ChatSender) {
  update((all) =>
    all.map((t) =>
      t.id === threadId
        ? {
            ...t,
            unreadForCompany: side === "empresa" ? 0 : t.unreadForCompany,
            unreadForCandidate: side === "candidato" ? 0 : t.unreadForCandidate,
          }
        : t,
    ),
  );
}

export function setAutoEnabled(threadId: string, enabled: boolean) {
  update((all) => all.map((t) => (t.id === threadId ? { ...t, autoEnabled: enabled } : t)));
}

export function closeThread(threadId: string) {
  update((all) => all.map((t) => (t.id === threadId ? { ...t, status: "Encerrado" } : t)));
}

/** Mensagens automáticas de andamento do processo. */
export function autoStageMessage(
  candidateId: string,
  kind: "etapa" | "aprovado" | "reprovado" | "entrevista",
  data: { stage?: string; role?: string; detail?: string; author?: string },
) {
  const thread = findThreadByCandidate(candidateId);
  if (!thread || !thread.autoEnabled || thread.status === "Encerrado") return;
  const first = thread.candidateName.split(" ")[0];
  const stage = data.stage ?? thread.stage;
  let text = "";
  if (kind === "etapa") {
    text = `Atualização do processo: ${first}, você avançou para a etapa "${stage}" na vaga de ${data.role ?? thread.role}. Em breve enviamos os próximos detalhes por aqui.`;
  } else if (kind === "aprovado") {
    text = `Parabéns, ${first}! 🎉 Você foi aprovada(o) no processo de ${data.role ?? thread.role}. Vamos alinhar os detalhes da contratação por este chat.`;
  } else if (kind === "reprovado") {
    text = `${first}, agradecemos muito sua participação no processo de ${data.role ?? thread.role}. Nesta etapa (${stage}) seguimos com outro perfil, mas seu currículo fica no nosso banco de talentos.`;
  } else {
    text = `${first}, sua entrevista foi agendada. ${data.detail ?? ""} Qualquer imprevisto, avise por aqui.`.trim();
  }

  update((all) =>
    all.map((t) =>
      t.id === thread.id
        ? {
            ...t,
            stage: stage ?? t.stage,
            status:
              kind === "aprovado" ? "Contratado" : kind === "reprovado" ? "Encerrado" : t.status,
            unreadForCandidate: t.unreadForCandidate + 1,
            messages: [
              ...t.messages,
              {
                id: uid(),
                from: "empresa" as ChatSender,
                kind: "auto" as const,
                text,
                at: now(),
                author: data.author ?? "Atualização automática",
                ...(stage ? { stage } : {}),
              },
            ],
          }
        : t,
    ),
  );
}
