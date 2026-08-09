import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { autoStageMessage } from "@/lib/chat";
import {
  formatWhen,
  removeMeetingInvites,
  setMeetingInvitesStatus,
  syncMeetingInvites,
} from "@/lib/meetings";
import {
  createCompany,
  fetchMyCompany,
  loadCompanyCandidates,
  loadCompanyVacancies,
  moveApplicationStage,
  rejectApplication,
  removeVacancyDb,
  restoreApplication,
  setVacancyStatusDb,
  updateCompany,
  createVacancy,
  type CompanyRow,
} from "@/lib/db/company";

export type NotificationKind = "etapa" | "aprovado" | "reprovado" | "entrevista" | "reuniao";

export type CompanyNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  detail: string;
  at: string;
  read: boolean;
};


export const stages = [
  "Triagem",
  "Entrevista RH",
  "Teste técnico",
  "Entrevista gestor",
  "Proposta",
  "Contratado",
] as const;

export type Stage = (typeof stages)[number];

export type VacancyType = "Contratual" | "Freelance";

export type Vacancy = {
  id: string;
  role: string;
  area: string;
  city: string;
  model: "Remoto" | "Híbrido" | "Presencial";
  contract: "CLT" | "PJ" | "Estágio";
  salaryMin: number;
  salaryMax: number;
  seniority: "Júnior" | "Pleno" | "Sênior";
  status: "Publicada" | "Pausada" | "Encerrada";
  openings: number;
  published: string;
  publishedAt?: string;
  skills: string[];
  description: string;
  /** Contratual = aparece no painel do candidato. Freelance = aparece na página de freelas. */
  type: VacancyType;
  /** Somente para freelas */
  dailyRate?: number;
  hours?: string;
  period?: string;
  /** Contato exibido no botão "Contato" da vaga */
  contact?: string;
};

export type Note = { id: string; author: string; text: string; at: string };

export type Candidate = {
  id: string;
  vacancyId: string;
  name: string;
  headline: string;
  city: string;
  model: "Remoto" | "Híbrido" | "Presencial";
  salaryExpectation: number;
  experience: number;
  skills: string[];
  score: number;
  stage: Stage;
  appliedAt: string;
  avatarTone: string;
  favorite: boolean;
  rejected?: boolean;
  scorecard?: { culture: number; technical: number; communication: number };
  notes: Note[];
  timeline: { id: string; label: string; at: string }[];
};

export type Interview = {
  id: string;
  candidateId: string;
  vacancyId: string;
  date: string;
  time: string;
  kind: "Entrevista RH" | "Entrevista gestor" | "Teste técnico" | "Alinhamento de proposta";
  interviewer: string;
  link: string;
};

export const REUNIAO_TIPOS = [
  { id: "video", label: "Vídeo" },
  { id: "audio", label: "Áudio" },
  { id: "presencial", label: "Presencial" },
] as const;

export const REUNIAO_STATUS = [
  { id: "agendada", label: "Agendada" },
  { id: "realizada", label: "Realizada" },
  { id: "cancelada", label: "Cancelada" },
] as const;

export const labelOf = (
  list: readonly { id: string; label: string }[],
  id: string,
) => list.find((i) => i.id === id)?.label ?? id;

export type Meeting = {
  id: string;
  titulo: string;
  pauta: string;
  tipo: string;
  inicio: string;
  duracaoMin: number;
  participantes: string[];
  /** Candidatos convidados (ids) — recebem notificação e mensagem no chat. */
  candidatos?: string[];
  link: string;
  status: string;
};


export type CompanyDoc = {
  id: string;
  name: string;
  category: "Política de RH" | "Código de conduta" | "Benefícios" | "Processo seletivo" | "Outros";
  description: string;
  fileName: string;
  size: number;
  url: string;
  updatedAt: string;
};

export type CompanyProfile = {
  name: string;
  segment: string;
  size: string;
  city: string;
  site: string;
  about: string;
  rating: number;
  recommend: number;
  benefits: string[];
  /* Página pública da empresa */
  founded: string;
  history: string;
  milestones: string[];
  cultureText: string;
  values: string[];
  workModel: string;
  benefitsDetail: string;
  hrContact: string;
  hrEmail: string;
  responseTime: string;
  processSteps: string[];
  diversity: string;
  /* Identidade visual e dados de contato */
  logoUrl: string;
  hrPhotoUrl: string;
  hrRole: string;
  hrPhone: string;
  hrLinkedin: string;
  documents: CompanyDoc[];
};


export type ActivityLog = { id: string; title: string; detail: string; at: string };

export const roles = ["Administrador", "RH", "Recrutador", "Gestor", "Observador"] as const;
export type Role = (typeof roles)[number];

export const permissions = [
  "ver_visao",
  "ver_pipeline",
  "ver_vagas",
  "ver_banco",
  "ver_entrevistas",
  "ver_reunioes",
  "ver_marca",
  "ver_modelos",
  "ver_equipe",
  "mover_candidato",
  "reprovar_candidato",
  "gerenciar_vagas",
  "agendar_entrevista",
  "gerenciar_reunioes",
  "editar_marca",
  "editar_modelos",
  "gerenciar_equipe",
] as const;
export type Permission = (typeof permissions)[number];

export const rolePermissions: Record<Role, Permission[]> = {
  Administrador: [...permissions],
  RH: [
    "ver_visao",
    "ver_pipeline",
    "ver_vagas",
    "ver_banco",
    "ver_entrevistas",
    "ver_reunioes",
    "ver_marca",
    "ver_modelos",
    "ver_equipe",
    "mover_candidato",
    "reprovar_candidato",
    "gerenciar_vagas",
    "agendar_entrevista",
    "gerenciar_reunioes",
    "editar_marca",
    "editar_modelos",
  ],
  Recrutador: [
    "ver_visao",
    "ver_pipeline",
    "ver_vagas",
    "ver_banco",
    "ver_entrevistas",
    "mover_candidato",
    "agendar_entrevista",
    "ver_reunioes",
    "gerenciar_reunioes",
  ],
  Gestor: [
    "ver_visao",
    "ver_pipeline",
    "ver_entrevistas",
    "ver_reunioes",
    "ver_vagas",
    "mover_candidato",
    "reprovar_candidato",
  ],
  Observador: ["ver_visao", "ver_vagas", "ver_entrevistas", "ver_reunioes"],
};

export const roleDescription: Record<Role, string> = {
  Administrador: "Acesso total, incluindo equipe, permissões e marca empregadora.",
  RH: "Conduz processos ponta a ponta: pipeline, vagas, entrevistas e marca.",
  Recrutador: "Trabalha o pipeline, banco de talentos e agenda entrevistas.",
  Gestor: "Avalia pessoas nas etapas das próprias vagas e dá o parecer final.",
  Observador: "Somente leitura de indicadores, vagas e agenda.",
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Ativo" | "Convite pendente";
  invitedAt: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const tones = ["bg-brand", "bg-brand-cyan", "bg-ink", "bg-coral", "bg-mint"];

const defaultProfile: CompanyProfile = {
  name: "",
  segment: "",
  size: "",
  city: "",
  site: "",
  about: "",
  rating: 0,
  recommend: 0,
  benefits: [],
  founded: "",
  history: "",
  milestones: [],
  cultureText: "",
  values: [],
  workModel: "",
  benefitsDetail: "",
  hrContact: "",
  hrEmail: "",
  responseTime: "",
  processSteps: [],
  diversity: "",
  logoUrl: "",
  hrPhotoUrl: "",
  hrRole: "",
  hrPhone: "",
  hrLinkedin: "",
  documents: [],
};

type CompanyState = {
  loading: boolean;
  authenticated: boolean;
  company: CompanyRow | null;
  createCompanyProfile: (input: {
    name: string;
    segment: string;
    city: string;
    about?: string;
    website?: string;
  }) => Promise<void>;
  reload: () => Promise<void>;
  vacancies: Vacancy[];
  candidates: Candidate[];
  interviews: Interview[];
  meetings: Meeting[];
  profile: CompanyProfile;
  logs: ActivityLog[];
  notifications: CompanyNotification[];
  unreadCount: number;
  markNotificationsRead: () => void;
  clearNotifications: () => void;
  members: Member[];
  currentMemberId: string;
  currentMember: Member;
  can: (p: Permission) => boolean;
  addMember: (m: { name: string; email: string; role: Role }) => void;
  updateMemberRole: (id: string, role: Role) => void;
  activateMember: (id: string) => void;
  removeMember: (id: string) => void;
  setCurrentMember: (id: string) => void;
  moveStage: (candidateId: string, stage: Stage) => void;
  advance: (candidateId: string) => void;
  reject: (candidateId: string) => void;
  restore: (candidateId: string) => void;
  toggleFavorite: (candidateId: string) => void;
  addNote: (candidateId: string, text: string) => void;
  setScorecard: (candidateId: string, s: NonNullable<Candidate["scorecard"]>) => void;
  scheduleInterview: (i: Omit<Interview, "id">) => void;
  cancelInterview: (id: string) => void;
  addMeeting: (m: Omit<Meeting, "id">) => void;
  updateMeeting: (id: string, m: Partial<Omit<Meeting, "id">>) => void;
  setMeetingStatus: (id: string, status: string) => void;
  rescheduleMeeting: (id: string, inicio: string, motivo?: string) => void;
  cancelMeeting: (id: string, motivo?: string) => void;
  removeMeeting: (id: string) => void;
  addVacancy: (v: Omit<Vacancy, "id" | "published" | "status">) => void;
  setVacancyStatus: (id: string, status: Vacancy["status"]) => void;
  removeVacancy: (id: string) => void;
  updateProfile: (p: Partial<CompanyProfile>) => void;
  addDocument: (d: Omit<CompanyDoc, "id" | "updatedAt">) => void;
  removeDocument: (id: string) => void;
};

const Ctx = createContext<CompanyState | null>(null);
const KEY = "candidatu-company-extra";

type Persisted = {
  interviews: Interview[];
  meetings: Meeting[];
  profile: CompanyProfile;
  logs: ActivityLog[];
  notifications: CompanyNotification[];
  members: Member[];
  currentMemberId: string;
};

const emptyPersisted: Persisted = {
  interviews: [],
  meetings: [],
  profile: defaultProfile,
  logs: [],
  notifications: [],
  members: [],
  currentMemberId: "me",
};

export function CompanyStoreProvider({ children }: { children: ReactNode }) {
  const { user, profile: authProfile, loading: authLoading } = useAuth();

  const [company, setCompany] = useState<CompanyRow | null>(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const [state, setState] = useState<Persisted>(emptyPersisted);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        setState((s) => ({
          ...s,
          ...parsed,
          profile: { ...defaultProfile, ...(parsed.profile ?? {}) },
        }));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const reloadCompany = useCallback(async () => {
    if (!user) {
      setCompany(null);
      setCompanyLoading(false);
      return;
    }
    setCompanyLoading(true);
    try {
      const c = await fetchMyCompany(user.id);
      setCompany(c);
    } finally {
      setCompanyLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void reloadCompany();
  }, [authLoading, reloadCompany]);

  // Sincroniza os campos vindos do banco no perfil local.
  useEffect(() => {
    if (!company) return;
    setState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        name: company.name,
        segment: company.segment,
        city: company.city,
        about: company.about,
        site: company.website ?? "",
        logoUrl: company.logo_url ?? "",
      },
    }));
  }, [company]);

  const reloadData = useCallback(async () => {
    if (!company) {
      setVacancies([]);
      setCandidates([]);
      return;
    }
    const [v, c] = await Promise.all([
      loadCompanyVacancies(company.id),
      loadCompanyCandidates(company.id),
    ]);
    setVacancies(v);
    setCandidates(c);
  }, [company]);

  useEffect(() => {
    void reloadData();
  }, [reloadData]);

  const createCompanyProfile = useCallback(
    async (input: { name: string; segment: string; city: string; about?: string; website?: string }) => {
      if (!user) return;
      const c = await createCompany(user.id, input);
      setCompany(c);
    },
    [user],
  );

  const log = useCallback((title: string, detail: string) => {
    setState((s) => ({
      ...s,
      logs: [{ id: uid(), title, detail, at: now() }, ...s.logs].slice(0, 60),
    }));
  }, []);

  const notify = useCallback((kind: NotificationKind, title: string, detail: string) => {
    setState((s) => ({
      ...s,
      notifications: [
        { id: uid(), kind, title, detail, at: now(), read: false },
        ...s.notifications,
      ].slice(0, 40),
    }));
    if (kind === "reprovado") toast.error(title, { description: detail });
    else if (kind === "aprovado") toast.success(title, { description: detail });
    else toast(title, { description: detail });
  }, []);

  const patchCandidate = useCallback((id: string, fn: (c: Candidate) => Candidate) => {
    setCandidates((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));
  }, []);

  const membersList = useMemo<Member[]>(() => {
    const me: Member = {
      id: "me",
      name: authProfile?.name ?? "Você",
      email: authProfile?.email ?? "",
      role: "Administrador",
      status: "Ativo",
      invitedAt: now(),
    };
    const rest = state.members.filter((m) => m.id !== "me");
    return [me, ...rest];
  }, [authProfile, state.members]);

  const value = useMemo<CompanyState>(() => {
    const authorName = () =>
      membersList.find((m) => m.id === state.currentMemberId)?.name ?? "Equipe de recrutamento";

    const moveStage = (candidateId: string, stage: Stage) => {
      const before = candidates.find((c) => c.id === candidateId);
      const name = before?.name ?? "Candidato";
      const previous = before?.stage ?? null;
      patchCandidate(candidateId, (c) => ({
        ...c,
        stage,
        rejected: false,
        timeline: [{ id: uid(), label: `Movido para ${stage}`, at: now() }, ...c.timeline],
      }));
      const role = vacancies.find((v) => v.id === before?.vacancyId)?.role ?? "vaga";
      void moveApplicationStage(candidateId, stage)
        .then(() => reloadData())
        .catch(() => toast.error("Não foi possível atualizar a etapa"));
      log("Etapa atualizada", `${name} foi movida(o) para ${stage}.`);
      if (stage === "Contratado") {
        notify("aprovado", `${name} foi aprovada(o)! 🎉`, `Contratação confirmada para ${role}.`);
        autoStageMessage(candidateId, "aprovado", { stage, role, author: authorName() });
      } else if (previous !== stage) {
        notify(
          "etapa",
          `${name} avançou para ${stage}`,
          `Processo de ${role}${previous ? ` · saiu de ${previous}` : ""}.`,
        );
        autoStageMessage(candidateId, "etapa", { stage, role, author: authorName() });
      }
    };

    const currentMember =
      membersList.find((m) => m.id === state.currentMemberId) ?? membersList[0]!;
    const allowed = rolePermissions[currentMember.role] ?? [];

    return {
      loading: authLoading || companyLoading,
      authenticated: Boolean(user),
      company,
      createCompanyProfile,
      reload: async () => {
        await reloadCompany();
        await reloadData();
      },
      vacancies,
      candidates,
      interviews: state.interviews,
      meetings: state.meetings,
      profile: state.profile,
      logs: state.logs,
      notifications: state.notifications,
      members: membersList,
      currentMemberId: state.currentMemberId,
      currentMember,
      unreadCount: state.notifications.filter((n) => !n.read).length,
      markNotificationsRead: () =>
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearNotifications: () => setState((s) => ({ ...s, notifications: [] })),
      can: (p) => allowed.includes(p),
      addMember: ({ name, email, role }) => {
        setState((s) => ({
          ...s,
          members: [
            ...s.members,
            { id: uid(), name, email, role, status: "Convite pendente", invitedAt: now() },
          ],
        }));
        log("Convite enviado", `${name} foi convidada(o) como ${role}.`);
      },
      updateMemberRole: (id, role) => {
        setState((s) => ({
          ...s,
          members: s.members.map((m) => (m.id === id ? { ...m, role } : m)),
        }));
        log("Permissões atualizadas", `Novo cargo aplicado: ${role}.`);
      },
      activateMember: (id) =>
        setState((s) => ({
          ...s,
          members: s.members.map((m) => (m.id === id ? { ...m, status: "Ativo" } : m)),
        })),
      removeMember: (id) =>
        setState((s) => {
          const rest = s.members.filter((m) => m.id !== id);
          return {
            ...s,
            members: rest,
            currentMemberId:
              s.currentMemberId === id ? "me" : s.currentMemberId,
          };
        }),
      setCurrentMember: (id) => setState((s) => ({ ...s, currentMemberId: id })),
      moveStage,
      advance: (candidateId) => {
        const c = candidates.find((x) => x.id === candidateId);
        if (!c) return;
        const idx = stages.indexOf(c.stage);
        const next = stages[Math.min(idx + 1, stages.length - 1)] ?? c.stage;
        moveStage(candidateId, next);
      },
      reject: (candidateId) => {
        const before = candidates.find((c) => c.id === candidateId);
        const name = before?.name ?? "Candidato";
        const feedback = `Feedback enviado${before ? ` na etapa ${before.stage}` : ""}.`;
        patchCandidate(candidateId, (c) => ({
          ...c,
          rejected: true,
          timeline: [
            { id: uid(), label: "Reprovado com feedback enviado", at: now() },
            ...c.timeline,
          ],
        }));
        void rejectApplication(candidateId, feedback)
          .then(() => reloadData())
          .catch(() => toast.error("Não foi possível registrar a reprovação"));
        log("Feedback enviado", `${name} recebeu retorno de reprovação.`);
        notify("reprovado", `${name} foi reprovada(o)`, feedback);
        autoStageMessage(candidateId, "reprovado", {
          ...(before ? { stage: before.stage } : {}),
          role: vacancies.find((v) => v.id === before?.vacancyId)?.role ?? "vaga",
          author: authorName(),
        });
      },
      restore: (candidateId) => {
        patchCandidate(candidateId, (c) => ({
          ...c,
          rejected: false,
          timeline: [{ id: uid(), label: "Reativado no processo", at: now() }, ...c.timeline],
        }));
        void restoreApplication(candidateId)
          .then(() => reloadData())
          .catch(() => toast.error("Não foi possível reativar a candidatura"));
      },
      toggleFavorite: (candidateId) =>
        patchCandidate(candidateId, (c) => ({ ...c, favorite: !c.favorite })),
      addNote: (candidateId, text) => {
        patchCandidate(candidateId, (c) => ({
          ...c,
          notes: [{ id: uid(), author: "Você", text, at: now() }, ...c.notes],
        }));
        log("Nota adicionada", text.slice(0, 90));
      },
      setScorecard: (candidateId, scorecard) => {
        patchCandidate(candidateId, (c) => ({
          ...c,
          scorecard,
          timeline: [{ id: uid(), label: "Scorecard preenchido", at: now() }, ...c.timeline],
        }));
        log("Scorecard salvo", "Avaliação estruturada registrada.");
      },
      scheduleInterview: (i) => {
        setState((s) => ({ ...s, interviews: [...s.interviews, { ...i, id: uid() }] }));
        log("Entrevista agendada", `${i.kind} em ${i.date} às ${i.time}.`);
        const name = candidates.find((c) => c.id === i.candidateId)?.name ?? "Candidato";
        const when = `${i.kind} em ${new Date(`${i.date}T00:00:00`).toLocaleDateString("pt-BR")} às ${i.time} com ${i.interviewer}.`;
        notify("entrevista", `Entrevista agendada com ${name}`, when);
        autoStageMessage(i.candidateId, "entrevista", {
          detail: `${when} Link: ${i.link}`,
          author: authorName(),
        });
      },
      cancelInterview: (id) =>
        setState((s) => ({ ...s, interviews: s.interviews.filter((i) => i.id !== id) })),
      addMeeting: (m) => {
        const id = uid();
        setState((s) => ({ ...s, meetings: [{ ...m, id }, ...s.meetings] }));
        const quando = formatWhen(m.inicio);
        log("Reunião agendada", `${m.titulo} · ${quando}`);
        const author = authorName();
        const convidados = (m.candidatos ?? []).map((cid) => ({
          id: cid,
          name: candidates.find((c) => c.id === cid)?.name ?? "Candidato",
        }));
        syncMeetingInvites({
          meetingId: id,
          titulo: m.titulo,
          pauta: m.pauta,
          tipo: m.tipo,
          inicio: m.inicio,
          duracaoMin: m.duracaoMin,
          link: m.link,
          status: m.status,
          companyName: state.profile.name,
          candidatos: convidados,
          by: author,
          kind: "criada",
          detail: `Reunião criada para ${quando}.`,
        });
        convidados.forEach((cand) => {
          notify(
            "reuniao",
            `Reunião marcada com ${cand.name}`,
            `${m.titulo} em ${quando} (${m.duracaoMin} min). Aguardando confirmação de presença.`,
          );
          autoStageMessage(cand.id, "reuniao", {
            detail: `${m.titulo} em ${quando} · ${m.duracaoMin} min${m.pauta ? ` · Pauta: ${m.pauta}` : ""}${m.link ? ` · Link: ${m.link}` : ""}`,
            author,
          });
        });
      },
      updateMeeting: (id, patch) => {
        setState((s) => ({
          ...s,
          meetings: s.meetings.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        }));
        log("Reunião atualizada", "Dados da reunião foram alterados.");
        const atual = state.meetings.find((m) => m.id === id);
        const merged = { ...atual, ...patch } as Meeting;
        const author = authorName();
        const remarcada = Boolean(patch.inicio && atual && patch.inicio !== atual.inicio);
        const quando = merged.inicio ? formatWhen(merged.inicio) : "";
        const convidados = (merged.candidatos ?? []).map((cid) => ({
          id: cid,
          name: candidates.find((c) => c.id === cid)?.name ?? "Candidato",
        }));
        syncMeetingInvites({
          meetingId: id,
          titulo: merged.titulo,
          pauta: merged.pauta,
          tipo: merged.tipo,
          inicio: merged.inicio,
          duracaoMin: merged.duracaoMin,
          link: merged.link,
          status: merged.status,
          companyName: state.profile.name,
          candidatos: convidados,
          by: author,
          kind: remarcada ? "reagendada" : "atualizada",
          detail: remarcada
            ? `Reunião reagendada para ${quando}.`
            : `Dados da reunião atualizados (${quando}).`,
          ...(remarcada ? { resetRsvp: true } : {}),
        });
        convidados.forEach((cand) => {
          notify(
            "reuniao",
            `Reunião ${remarcada ? "reagendada" : "atualizada"} · ${cand.name}`,
            `${merged.titulo} em ${quando}.`,
          );
          autoStageMessage(cand.id, remarcada ? "cancelamento" : "reuniao", {
            detail: remarcada
              ? `A reunião "${merged.titulo}" foi reagendada para ${quando} · ${merged.duracaoMin} min${merged.link ? ` · Link: ${merged.link}` : ""}. Confirme novamente sua presença.`
              : `Atualizamos a reunião "${merged.titulo}": ${quando} · ${merged.duracaoMin} min${merged.link ? ` · Link: ${merged.link}` : ""}`,
            author,
          });
        });
      },
      rescheduleMeeting: (id, inicio, motivo) => {
        const atual = state.meetings.find((m) => m.id === id);
        if (!atual) return;
        setState((s) => ({
          ...s,
          meetings: s.meetings.map((m) => (m.id === id ? { ...m, inicio, status: "agendada" } : m)),
        }));
        const author = authorName();
        const quando = formatWhen(inicio);
        const antes = formatWhen(atual.inicio);
        log("Reunião reagendada", `${atual.titulo}: ${antes} → ${quando}.`);
        const convidados = (atual.candidatos ?? []).map((cid) => ({
          id: cid,
          name: candidates.find((c) => c.id === cid)?.name ?? "Candidato",
        }));
        syncMeetingInvites({
          meetingId: id,
          titulo: atual.titulo,
          pauta: atual.pauta,
          tipo: atual.tipo,
          inicio,
          duracaoMin: atual.duracaoMin,
          link: atual.link,
          status: "agendada",
          companyName: state.profile.name,
          candidatos: convidados,
          by: author,
          kind: "reagendada",
          detail: `De ${antes} para ${quando}.${motivo ? ` Motivo: ${motivo}` : ""}`,
          resetRsvp: true,
        });
        convidados.forEach((cand) => {
          notify(
            "reuniao",
            `Reunião reagendada · ${cand.name}`,
            `${atual.titulo}: ${antes} → ${quando}.`,
          );
          autoStageMessage(cand.id, "cancelamento", {
            detail: `A reunião "${atual.titulo}" foi reagendada de ${antes} para ${quando}.${motivo ? ` Motivo: ${motivo}.` : ""} Confirme novamente sua presença.`,
            author,
          });
        });
      },
      cancelMeeting: (id, motivo) => {
        const atual = state.meetings.find((m) => m.id === id);
        if (!atual) return;
        setState((s) => ({
          ...s,
          meetings: s.meetings.map((m) => (m.id === id ? { ...m, status: "cancelada" } : m)),
        }));
        const author = authorName();
        const quando = formatWhen(atual.inicio);
        log("Reunião cancelada", `${atual.titulo} · ${quando}.${motivo ? ` Motivo: ${motivo}` : ""}`);
        setMeetingInvitesStatus(
          id,
          "cancelada",
          author,
          `Reunião cancelada.${motivo ? ` Motivo: ${motivo}` : ""}`,
        );
        (atual.candidatos ?? []).forEach((cid) => {
          const cand = candidates.find((c) => c.id === cid);
          notify(
            "reuniao",
            `Reunião cancelada · ${cand?.name ?? "candidato"}`,
            `${atual.titulo} de ${quando} foi cancelada.`,
          );
          autoStageMessage(cid, "cancelamento", {
            detail: `A reunião "${atual.titulo}" marcada para ${quando} foi cancelada.${motivo ? ` Motivo: ${motivo}.` : ""} Em breve enviamos uma nova data.`,
            author,
          });
        });
      },
      setMeetingStatus: (id, status) => {
        setState((s) => ({
          ...s,
          meetings: s.meetings.map((m) => (m.id === id ? { ...m, status } : m)),
        }));
        const author = authorName();
        log("Status da reunião", `Reunião marcada como ${labelOf(REUNIAO_STATUS, status)}.`);
        setMeetingInvitesStatus(
          id,
          status,
          author,
          `Status alterado para ${labelOf(REUNIAO_STATUS, status)}.`,
        );
      },
      removeMeeting: (id) => {
        setState((s) => ({ ...s, meetings: s.meetings.filter((m) => m.id !== id) }));
        removeMeetingInvites(id);
      },
      addVacancy: (v) => {
        if (!company || !user) return;
        void createVacancy(company.id, user.id, v)
          .then(() => reloadData())
          .catch(() => toast.error("Não foi possível publicar a vaga"));
        log("Vaga publicada", `${v.role} · ${v.city}`);
      },
      setVacancyStatus: (id, status) => {
        setVacancies((vs) => vs.map((v) => (v.id === id ? { ...v, status } : v)));
        void setVacancyStatusDb(id, status)
          .then(() => reloadData())
          .catch(() => toast.error("Não foi possível atualizar a vaga"));
        log("Status da vaga", `Vaga marcada como ${status}.`);
      },
      removeVacancy: (id) => {
        setVacancies((vs) => vs.filter((v) => v.id !== id));
        void removeVacancyDb(id)
          .then(() => reloadData())
          .catch(() => toast.error("Não foi possível excluir a vaga"));
      },
      updateProfile: (p) => {
        setState((s) => ({ ...s, profile: { ...s.profile, ...p } }));
        if (company) {
          const patch: Partial<CompanyRow> = {};
          if (p.name !== undefined) patch.name = p.name;
          if (p.segment !== undefined) patch.segment = p.segment;
          if (p.city !== undefined) patch.city = p.city;
          if (p.about !== undefined) patch.about = p.about;
          if (p.site !== undefined) patch.website = p.site;
          if (p.logoUrl !== undefined) patch.logo_url = p.logoUrl;
          if (Object.keys(patch).length > 0) {
            void updateCompany(company.id, patch).catch(() =>
              toast.error("Não foi possível salvar o perfil da empresa"),
            );
          }
        }
        log("Perfil da empresa", "Informações atualizadas.");
      },
      addDocument: (d) => {
        setState((s) => ({
          ...s,
          profile: {
            ...s.profile,
            documents: [{ ...d, id: uid(), updatedAt: now() }, ...s.profile.documents],
          },
        }));
        log("Documento publicado", `${d.name} disponível para download.`);
      },
      removeDocument: (id) =>
        setState((s) => ({
          ...s,
          profile: {
            ...s.profile,
            documents: s.profile.documents.filter((d) => d.id !== id),
          },
        })),
    };
  }, [
    state,
    patchCandidate,
    log,
    notify,
    vacancies,
    candidates,
    company,
    user,
    authLoading,
    companyLoading,
    createCompanyProfile,
    reloadCompany,
    reloadData,
    membersList,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCompanyStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCompanyStore precisa estar dentro de CompanyStoreProvider");
  return ctx;
}

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
