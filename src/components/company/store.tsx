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

export type NotificationKind = "etapa" | "aprovado" | "reprovado" | "entrevista";

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
  skills: string[];
  description: string;
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
  "ver_marca",
  "ver_equipe",
  "mover_candidato",
  "reprovar_candidato",
  "gerenciar_vagas",
  "agendar_entrevista",
  "editar_marca",
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
    "ver_marca",
    "ver_equipe",
    "mover_candidato",
    "reprovar_candidato",
    "gerenciar_vagas",
    "agendar_entrevista",
    "editar_marca",
  ],
  Recrutador: [
    "ver_visao",
    "ver_pipeline",
    "ver_vagas",
    "ver_banco",
    "ver_entrevistas",
    "mover_candidato",
    "agendar_entrevista",
  ],
  Gestor: [
    "ver_visao",
    "ver_pipeline",
    "ver_entrevistas",
    "ver_vagas",
    "mover_candidato",
    "reprovar_candidato",
  ],
  Observador: ["ver_visao", "ver_vagas", "ver_entrevistas"],
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

export const seedMembers: Member[] = [
  {
    id: "m1",
    name: "Fernanda Lopes",
    email: "fernanda@candidatu.com.br",
    role: "Administrador",
    status: "Ativo",
    invitedAt: "2026-01-12T12:00:00.000Z",
  },
  {
    id: "m2",
    name: "Rita Menezes",
    email: "rita@candidatu.com.br",
    role: "RH",
    status: "Ativo",
    invitedAt: "2026-02-02T12:00:00.000Z",
  },
  {
    id: "m3",
    name: "Diego Ramos",
    email: "diego@candidatu.com.br",
    role: "Recrutador",
    status: "Ativo",
    invitedAt: "2026-03-18T12:00:00.000Z",
  },
  {
    id: "m4",
    name: "Marcos Prado",
    email: "marcos@candidatu.com.br",
    role: "Gestor",
    status: "Convite pendente",
    invitedAt: "2026-07-29T12:00:00.000Z",
  },
];

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

export const seedVacancies: Vacancy[] = [
  {
    id: "v1",
    role: "Pessoa Desenvolvedora Front-end",
    area: "Tecnologia",
    city: "São Paulo, SP",
    model: "Remoto",
    contract: "CLT",
    salaryMin: 8000,
    salaryMax: 11500,
    seniority: "Pleno",
    status: "Publicada",
    openings: 2,
    published: "há 3 dias",
    skills: ["React", "TypeScript", "Design System", "Testes"],
    description:
      "Squad de produto responsável pela experiência de candidatura. Processo com 4 etapas e feedback em até 5 dias.",
  },
  {
    id: "v2",
    role: "Analista de People & Cultura",
    area: "Recursos Humanos",
    city: "Belo Horizonte, MG",
    model: "Híbrido",
    contract: "CLT",
    salaryMin: 5200,
    salaryMax: 7000,
    seniority: "Pleno",
    status: "Publicada",
    openings: 1,
    published: "há 8 dias",
    skills: ["Recrutamento", "Employer branding", "Indicadores", "Onboarding"],
    description:
      "Conduzir processos ponta a ponta, cuidar da experiência da pessoa candidata e dos indicadores de contratação.",
  },
  {
    id: "v3",
    role: "Designer de Produto",
    area: "Design",
    city: "Remoto (Brasil)",
    model: "Remoto",
    contract: "PJ",
    salaryMin: 9000,
    salaryMax: 13000,
    seniority: "Sênior",
    status: "Publicada",
    openings: 1,
    published: "há 1 dia",
    skills: ["Pesquisa", "Figma", "Acessibilidade", "Product Discovery"],
    description:
      "Liderar discovery e entregar fluxos de ponta a ponta junto com engenharia e dados.",
  },
  {
    id: "v4",
    role: "Analista de Dados",
    area: "Dados",
    city: "Curitiba, PR",
    model: "Presencial",
    contract: "CLT",
    salaryMin: 6500,
    salaryMax: 9000,
    seniority: "Júnior",
    status: "Pausada",
    openings: 1,
    published: "há 21 dias",
    skills: ["SQL", "Python", "Dashboards"],
    description: "Construir dashboards de funil de contratação e apoiar decisões de People Analytics.",
  },
];

const tones = ["bg-brand", "bg-brand-cyan", "bg-ink", "bg-coral", "bg-mint"];

function makeCandidate(
  i: number,
  vacancyId: string,
  name: string,
  headline: string,
  city: string,
  model: Candidate["model"],
  salaryExpectation: number,
  experience: number,
  skills: string[],
  score: number,
  stage: Stage,
  appliedAt: string,
): Candidate {
  return {
    id: `c${i}`,
    vacancyId,
    name,
    headline,
    city,
    model,
    salaryExpectation,
    experience,
    skills,
    score,
    stage,
    appliedAt,
    avatarTone: tones[i % tones.length] ?? "bg-brand",
    favorite: score >= 90,
    notes: [],
    timeline: [{ id: uid(), label: "Candidatura recebida", at: appliedAt }],
  };
}

export const seedCandidates: Candidate[] = [
  makeCandidate(1, "v1", "Marina Alves", "Front-end pleno · 5 anos", "São Paulo, SP", "Remoto", 10500, 5, ["React", "TypeScript", "Testes"], 94, "Entrevista gestor", "há 3 dias"),
  makeCandidate(2, "v1", "Rafael Duarte", "Front-end pleno · 4 anos", "Campinas, SP", "Remoto", 9500, 4, ["React", "Design System"], 88, "Teste técnico", "há 4 dias"),
  makeCandidate(3, "v1", "Camila Souza", "Full-stack · 6 anos", "Recife, PE", "Remoto", 11500, 6, ["React", "Node", "TypeScript"], 82, "Entrevista RH", "há 2 dias"),
  makeCandidate(4, "v1", "Bruno Martins", "Front-end júnior · 2 anos", "Porto Alegre, RS", "Híbrido", 7000, 2, ["React", "CSS"], 61, "Triagem", "há 1 dia"),
  makeCandidate(5, "v2", "Letícia Prado", "Analista de RH · 4 anos", "Belo Horizonte, MG", "Híbrido", 6400, 4, ["Recrutamento", "Indicadores"], 91, "Proposta", "há 9 dias"),
  makeCandidate(6, "v2", "Diego Ramos", "Recrutador tech · 3 anos", "Contagem, MG", "Híbrido", 5800, 3, ["Recrutamento", "Hunting"], 76, "Entrevista RH", "há 6 dias"),
  makeCandidate(7, "v3", "Aline Ferreira", "Product Designer · 8 anos", "Remoto", "Remoto", 12500, 8, ["Figma", "Pesquisa", "Acessibilidade"], 96, "Entrevista gestor", "há 1 dia"),
  makeCandidate(8, "v3", "Thiago Lima", "Designer de produto · 5 anos", "Florianópolis, SC", "Remoto", 10500, 5, ["Figma", "Discovery"], 79, "Triagem", "há 1 dia"),
  makeCandidate(9, "v4", "Juliana Reis", "Analista de dados · 2 anos", "Curitiba, PR", "Presencial", 7200, 2, ["SQL", "Python"], 84, "Teste técnico", "há 12 dias"),
  makeCandidate(10, "v1", "Pedro Nogueira", "Front-end sênior · 9 anos", "São Paulo, SP", "Remoto", 13000, 9, ["React", "TypeScript", "Arquitetura"], 87, "Contratado", "há 20 dias"),
];

export const seedInterviews: Interview[] = [
  { id: "i1", candidateId: "c1", vacancyId: "v1", date: "2026-08-11", time: "10:00", kind: "Entrevista gestor", interviewer: "Marcos (Tech Lead)", link: "meet.candidatu.com/mar-101" },
  { id: "i2", candidateId: "c7", vacancyId: "v3", date: "2026-08-11", time: "15:30", kind: "Entrevista gestor", interviewer: "Rita (Head de Design)", link: "meet.candidatu.com/ali-330" },
  { id: "i3", candidateId: "c3", vacancyId: "v1", date: "2026-08-12", time: "09:00", kind: "Entrevista RH", interviewer: "Fernanda (People)", link: "meet.candidatu.com/cam-900" },
  { id: "i4", candidateId: "c5", vacancyId: "v2", date: "2026-08-13", time: "14:00", kind: "Alinhamento de proposta", interviewer: "Fernanda (People)", link: "meet.candidatu.com/let-140" },
];

const defaultProfile: CompanyProfile = {
  name: "Candidatu Labs",
  segment: "Tecnologia · Produto digital",
  size: "180 pessoas",
  city: "São Paulo, SP",
  site: "candidatu.com.br",
  about:
    "Time de produto que constrói ferramentas de recrutamento transparente. Salário aberto em 100% das vagas e feedback garantido em até 5 dias.",
  rating: 4.6,
  recommend: 92,
  benefits: ["Salário aberto", "Home office flexível", "Plano de saúde", "Auxílio educação"],
  founded: "2019",
  history:
    "A Candidatu Labs nasceu em 2019, dentro de um squad de produto que se cansou de processos seletivos sem retorno. Começamos com uma planilha compartilhada entre três recrutadores e hoje somos um time de 180 pessoas atendendo empresas em todo o Brasil, com salário aberto em 100% das vagas.",
  milestones: [
    "2019 · Primeira versão do painel de vagas com salário aberto",
    "2021 · 10 mil candidaturas com feedback garantido",
    "2023 · Termômetro Candidatu de avaliações de processos",
    "2025 · Time de People distribuído em 6 estados",
  ],
  cultureText:
    "Trabalhamos em times pequenos e autônomos, com decisões documentadas e feedback direto. Ninguém precisa adivinhar em que etapa está — dentro ou fora do processo seletivo.",
  values: [
    "Transparência radical",
    "Feedback em toda etapa",
    "Autonomia com contexto",
    "Diversidade na prática",
  ],
  workModel: "Híbrido flexível · 2 dias presenciais opcionais",
  benefitsDetail:
    "Plano de saúde e odontológico sem coparticipação, vale-refeição de R$ 1.100, auxílio home office de R$ 200, R$ 3.000/ano de auxílio educação, licença parental estendida e day off no aniversário.",
  hrContact: "Marina Prado · Head de People & Cultura",
  hrEmail: "people@candidatu.com.br",
  responseTime: "Resposta em até 5 dias úteis em cada etapa",
  processSteps: [
    "Inscrição e triagem de perfil",
    "Conversa com RH (30 min)",
    "Entrevista técnica com o time",
    "Conversa com a liderança",
    "Proposta com faixa salarial aberta",
  ],
  diversity:
    "Processos com currículo às cegas na triagem inicial, metas públicas de diversidade e vagas afirmativas sinalizadas na descrição.",
  logoUrl: "",
  hrPhotoUrl: "",
  hrRole: "Head de People & Cultura",
  hrPhone: "(11) 99999-0000",
  hrLinkedin: "linkedin.com/company/candidatu",
  documents: [
    {
      id: "d1",
      name: "Política de RH e conduta interna",
      category: "Política de RH",
      description:
        "Regras de convivência, jornada, home office, licenças e canais de denúncia da Candidatu Labs.",
      fileName: "politica-rh-candidatu.pdf",
      size: 482000,
      url: "",
      updatedAt: "2026-05-14T12:00:00.000Z",
    },
    {
      id: "d2",
      name: "Guia de benefícios 2026",
      category: "Benefícios",
      description: "Detalhamento de plano de saúde, VR, auxílios e day off.",
      fileName: "guia-beneficios-2026.pdf",
      size: 310000,
      url: "",
      updatedAt: "2026-03-02T12:00:00.000Z",
    },
  ],
};

type CompanyState = {
  vacancies: Vacancy[];
  candidates: Candidate[];
  interviews: Interview[];
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
  addVacancy: (v: Omit<Vacancy, "id" | "published" | "status">) => void;
  setVacancyStatus: (id: string, status: Vacancy["status"]) => void;
  removeVacancy: (id: string) => void;
  updateProfile: (p: Partial<CompanyProfile>) => void;
};

const Ctx = createContext<CompanyState | null>(null);
const KEY = "candidatu-company";

type Persisted = {
  vacancies: Vacancy[];
  candidates: Candidate[];
  interviews: Interview[];
  profile: CompanyProfile;
  logs: ActivityLog[];
  notifications: CompanyNotification[];
  members: Member[];
  currentMemberId: string;
};

export function CompanyStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>({
    vacancies: seedVacancies,
    candidates: seedCandidates,
    interviews: seedInterviews,
    profile: defaultProfile,
    logs: [],
    notifications: [],
    members: seedMembers,
    currentMemberId: "m1",
  });
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

  const log = useCallback((title: string, detail: string) => {
    setState((s) => ({
      ...s,
      logs: [{ id: uid(), title, detail, at: now() }, ...s.logs].slice(0, 60),
    }));
  }, []);

  const notify = useCallback(
    (kind: NotificationKind, title: string, detail: string) => {
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
    },
    [],
  );



  const patchCandidate = useCallback(
    (id: string, fn: (c: Candidate) => Candidate) => {
      setState((s) => ({
        ...s,
        candidates: s.candidates.map((c) => (c.id === id ? fn(c) : c)),
      }));
    },
    [],
  );

  const value = useMemo<CompanyState>(() => {
    const moveStage = (candidateId: string, stage: Stage) => {
      const before = state.candidates.find((c) => c.id === candidateId);
      const name = before?.name ?? "Candidato";
      const previous = before?.stage ?? null;
      patchCandidate(candidateId, (c) => ({
        ...c,
        stage,
        rejected: false,
        timeline: [{ id: uid(), label: `Movido para ${stage}`, at: now() }, ...c.timeline],
      }));
      log("Etapa atualizada", `${name} foi movida(o) para ${stage}.`);
      const role = state.vacancies.find((v) => v.id === before?.vacancyId)?.role ?? "vaga";
      if (stage === "Contratado") {
        notify("aprovado", `${name} foi aprovada(o)! 🎉`, `Contratação confirmada para ${role}.`);
      } else if (previous !== stage) {
        notify(
          "etapa",
          `${name} avançou para ${stage}`,
          `Processo de ${role}${previous ? ` · saiu de ${previous}` : ""}.`,
        );
      }
    };

    const currentMember =
      state.members.find((m) => m.id === state.currentMemberId) ??
      state.members[0] ??
      seedMembers[0]!;
    const allowed = rolePermissions[currentMember.role] ?? [];

    return {
      ...state,
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
              s.currentMemberId === id ? (rest[0]?.id ?? s.currentMemberId) : s.currentMemberId,
          };
        }),
      setCurrentMember: (id) => setState((s) => ({ ...s, currentMemberId: id })),
      moveStage,
      advance: (candidateId) => {
        const c = state.candidates.find((x) => x.id === candidateId);
        if (!c) return;
        const idx = stages.indexOf(c.stage);
        const next = stages[Math.min(idx + 1, stages.length - 1)] ?? c.stage;
        moveStage(candidateId, next);
      },
      reject: (candidateId) => {
        const before = state.candidates.find((c) => c.id === candidateId);
        const name = before?.name ?? "Candidato";
        patchCandidate(candidateId, (c) => ({
          ...c,
          rejected: true,
          timeline: [
            { id: uid(), label: "Reprovado com feedback enviado", at: now() },
            ...c.timeline,
          ],
        }));
        log("Feedback enviado", `${name} recebeu retorno de reprovação.`);
        notify(
          "reprovado",
          `${name} foi reprovada(o)`,
          `Feedback enviado${before ? ` na etapa ${before.stage}` : ""}.`,
        );
      },
      restore: (candidateId) =>
        patchCandidate(candidateId, (c) => ({
          ...c,
          rejected: false,
          timeline: [{ id: uid(), label: "Reativado no processo", at: now() }, ...c.timeline],
        })),
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
        const name = state.candidates.find((c) => c.id === i.candidateId)?.name ?? "Candidato";
        notify(
          "entrevista",
          `Entrevista agendada com ${name}`,
          `${i.kind} em ${new Date(`${i.date}T00:00:00`).toLocaleDateString("pt-BR")} às ${i.time} com ${i.interviewer}.`,
        );
      },
      cancelInterview: (id) =>
        setState((s) => ({ ...s, interviews: s.interviews.filter((i) => i.id !== id) })),
      addVacancy: (v) => {
        setState((s) => ({
          ...s,
          vacancies: [
            { ...v, id: uid(), published: "agora", status: "Publicada" },
            ...s.vacancies,
          ],
        }));
        log("Vaga publicada", `${v.role} · ${v.city}`);
      },
      setVacancyStatus: (id, status) => {
        setState((s) => ({
          ...s,
          vacancies: s.vacancies.map((v) => (v.id === id ? { ...v, status } : v)),
        }));
        log("Status da vaga", `Vaga marcada como ${status}.`);
      },
      removeVacancy: (id) =>
        setState((s) => ({
          ...s,
          vacancies: s.vacancies.filter((v) => v.id !== id),
          candidates: s.candidates.filter((c) => c.vacancyId !== id),
        })),
      updateProfile: (p) => {
        setState((s) => ({ ...s, profile: { ...s.profile, ...p } }));
        log("Perfil da empresa", "Informações atualizadas.");
      },
    };
  }, [state, patchCandidate, log, notify]);

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
