import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
};

export type ActivityLog = { id: string; title: string; detail: string; at: string };

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
};

type CompanyState = {
  vacancies: Vacancy[];
  candidates: Candidate[];
  interviews: Interview[];
  profile: CompanyProfile;
  logs: ActivityLog[];
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
};

export function CompanyStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>({
    vacancies: seedVacancies,
    candidates: seedCandidates,
    interviews: seedInterviews,
    profile: defaultProfile,
    logs: [],
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        setState((s) => ({ ...s, ...parsed }));
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
      let name = "";
      patchCandidate(candidateId, (c) => {
        name = c.name;
        return {
          ...c,
          stage,
          rejected: false,
          timeline: [{ id: uid(), label: `Movido para ${stage}`, at: now() }, ...c.timeline],
        };
      });
      log("Etapa atualizada", `${name} foi movida(o) para ${stage}.`);
    };

    return {
      ...state,
      moveStage,
      advance: (candidateId) => {
        const c = state.candidates.find((x) => x.id === candidateId);
        if (!c) return;
        const idx = stages.indexOf(c.stage);
        const next = stages[Math.min(idx + 1, stages.length - 1)] ?? c.stage;
        moveStage(candidateId, next);
      },
      reject: (candidateId) => {
        let name = "";
        patchCandidate(candidateId, (c) => {
          name = c.name;
          return {
            ...c,
            rejected: true,
            timeline: [
              { id: uid(), label: "Reprovado com feedback enviado", at: now() },
              ...c.timeline,
            ],
          };
        });
        log("Feedback enviado", `${name} recebeu retorno de reprovação.`);
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
  }, [state, patchCandidate, log]);

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
