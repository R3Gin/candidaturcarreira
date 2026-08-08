import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Job = {
  id: string;
  role: string;
  company: string;
  city: string;
  salary: string;
  rating: number;
  match: string;
  tags: string[];
  posted: string;
  quickApply: boolean;
  segment: string;
  about: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  qualifications: string[];
};

export type AppEvent = {
  id: string;
  label: string;
  note: string;
  at: string;
};

export type Application = {
  id: string;
  jobId: string;
  company: string;
  role: string;
  city: string;
  salary: string;
  rating: number;
  stage: number;
  updated: string;
  next: string;
  feedback: string;
  events?: AppEvent[];
  letter?: string;
  qualifications?: string[];
};

export type ActivityKind =
  | "candidatura"
  | "etapa"
  | "salvar"
  | "seguir"
  | "perfil"
  | "curriculo"
  | "preferencias"
  | "alerta";

export type Activity = {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  at: string;
};

export type JobAlert = {
  id: string;
  jobId: string;
  title: string;
  detail: string;
  at: string;
  read: boolean;
};

export type Resume = {
  headline: string;
  summary: string;
  experiences: { role: string; company: string; period: string; bullets: string[] }[];
  skills: string[];
  education: string[];
  createdAt: string;
};


export type Company = {
  id: string;
  name: string;
  segment: string;
  rating: number;
  reason: string;
  since: string;
};

export type Preferences = {
  role: string;
  seniority: string;
  models: string[];
  city: string;
  minSalary: string;
  contracts: string[];
  availability: string;
  notifyEmail: boolean;
  notifyWhats: boolean;
};

export type Account = {
  name: string;
  email: string;
  phone: string;
  photo: string | null;
};

export const jobPool: Job[] = [
  {
    id: "j1",
    role: "Coordenador de Operações",
    company: "Grupo TBX",
    city: "Joinville · Híbrido",
    salary: "R$ 6.100 – R$ 8.000",
    rating: 4.4,
    match: "91%",
    tags: ["CLT", "Híbrido", "Bônus anual"],
    posted: "há 2 dias",
    quickApply: true,
    segment: "Indústria · 850 pessoas",
    about:
      "O Grupo TBX opera centros de distribuição em três estados e busca uma pessoa para coordenar rotinas de operação, indicadores e time de supervisores.",
    responsibilities: [
      "Coordenar a rotina diária de dois centros de distribuição",
      "Acompanhar indicadores de produtividade e propor planos de ação",
      "Liderar um time de 4 supervisores e 60 colaboradores",
    ],
    requirements: [
      "Ensino superior completo em Administração, Logística ou Engenharia",
      "Experiência com liderança de equipes operacionais",
      "Excel avançado e leitura de indicadores",
    ],
    benefits: ["Vale-refeição", "Plano de saúde", "PLR anual", "Auxílio combustível"],
    qualifications: ["Ensino superior", "Liderança de equipe", "Excel avançado"],
  },
  {
    id: "j2",
    role: "Analista de RH Jr.",
    company: "Alma Saúde",
    city: "São Paulo · Remoto",
    salary: "R$ 3.200 – R$ 4.100",
    rating: 4.1,
    match: "86%",
    tags: ["CLT", "Remoto", "Plano de saúde"],
    posted: "há 5 dias",
    quickApply: true,
    segment: "Saúde · 1.400 pessoas",
    about:
      "A Alma Saúde procura uma pessoa para apoiar recrutamento, onboarding e rotinas de departamento pessoal de forma 100% remota.",
    responsibilities: [
      "Conduzir triagens e entrevistas iniciais",
      "Apoiar o onboarding de novas pessoas",
      "Organizar indicadores de turnover e clima",
    ],
    requirements: [
      "Superior cursando ou completo em Psicologia, RH ou Administração",
      "Experiência prévia em recrutamento e seleção",
      "Boa comunicação escrita",
    ],
    benefits: ["Plano de saúde", "Home office setup", "Day off no aniversário"],
    qualifications: ["Superior cursando", "Recrutamento e seleção"],
  },
  {
    id: "j3",
    role: "Assistente Financeiro",
    company: "Pilar Capital",
    city: "Curitiba · Presencial",
    salary: "R$ 2.800 – R$ 3.500",
    rating: 3.8,
    match: "80%",
    tags: ["CLT", "Presencial", "VR + VT"],
    posted: "há 1 dia",
    quickApply: false,
    segment: "Serviços financeiros · 320 pessoas",
    about:
      "A Pilar Capital busca uma pessoa organizada para conciliação bancária, contas a pagar e apoio ao fechamento mensal.",
    responsibilities: [
      "Realizar conciliação bancária diária",
      "Lançar e conferir contas a pagar e receber",
      "Apoiar o fechamento mensal com a contabilidade",
    ],
    requirements: [
      "Ensino médio completo (superior é diferencial)",
      "Experiência com rotinas financeiras",
      "Excel intermediário",
    ],
    benefits: ["VR", "VT", "Convênio odontológico"],
    qualifications: ["Ensino médio", "Rotinas financeiras", "Excel intermediário"],
  },
  {
    id: "j4",
    role: "Analista Administrativo (Logística)",
    company: "Nuvem Log",
    city: "Joinville · Híbrido",
    salary: "R$ 2.990 – R$ 3.400",
    rating: 4.2,
    match: "88%",
    tags: ["CLT", "Híbrido", "Vale-refeição"],
    posted: "há 3 dias",
    quickApply: true,
    segment: "Logística · 240 pessoas",
    about:
      "A Nuvem Log procura apoio administrativo para documentação de cargas, relatórios de frota e atendimento a transportadoras.",
    responsibilities: [
      "Emitir e conferir documentos de transporte",
      "Manter relatórios de frota atualizados",
      "Atender transportadoras parceiras",
    ],
    requirements: [
      "Ensino médio completo",
      "Experiência com rotinas administrativas",
      "Pacote Office",
    ],
    benefits: ["Vale-refeição", "Transporte fretado", "Gympass"],
    qualifications: ["Ensino médio", "Pacote Office"],
  },
  {
    id: "j5",
    role: "Executivo de Relacionamento",
    company: "Vencer Educação",
    city: "São Paulo · Remoto",
    salary: "R$ 4.200 – R$ 7.400",
    rating: 4.6,
    match: "84%",
    tags: ["CLT", "Remoto", "Comissão"],
    posted: "há 6 dias",
    quickApply: true,
    segment: "Educação · 1.100 pessoas",
    about:
      "A Vencer Educação busca pessoas para relacionamento consultivo com escolas parceiras, com meta trimestral e comissionamento aberto.",
    responsibilities: [
      "Gerenciar carteira de escolas parceiras",
      "Negociar renovações de contrato",
      "Registrar interações no CRM",
    ],
    requirements: [
      "Superior completo",
      "Experiência em vendas consultivas B2B",
      "Disponibilidade para viagens pontuais",
    ],
    benefits: ["Comissão sem teto", "Plano de saúde", "Auxílio educação"],
    qualifications: ["Superior completo", "Vendas B2B"],
  },
  {
    id: "j6",
    role: "Auxiliar de Instalações",
    company: "Novalogic",
    city: "Curitiba · Presencial",
    salary: "R$ 2.050 – R$ 2.280",
    rating: 3.3,
    match: "72%",
    tags: ["CLT", "Turno fixo", "Transporte"],
    posted: "há 8 dias",
    quickApply: false,
    segment: "Telecom · 500 pessoas",
    about:
      "A Novalogic contrata auxiliares para instalação e manutenção de equipamentos em clientes residenciais e comerciais.",
    responsibilities: [
      "Instalar e configurar equipamentos em campo",
      "Realizar manutenções preventivas",
      "Registrar atendimentos no aplicativo da equipe",
    ],
    requirements: ["Ensino médio completo", "CNH categoria B", "Disponibilidade de turno"],
    benefits: ["Transporte", "VR", "Adicional de campo"],
    qualifications: ["Ensino médio", "CNH categoria B"],
  },
];

const seedApplications: Application[] = [
  {
    id: "a1",
    jobId: "j4",
    company: "Nuvem Log",
    role: "Analista Administrativo (Logística)",
    city: "Joinville · Híbrido",
    salary: "R$ 2.990 – R$ 3.400",
    rating: 4.2,
    stage: 2,
    updated: "Atualizada há 2 dias",
    next: "Entrevista com gestor em 12/08 às 14h",
    feedback: "Empresa deu procedência: seu perfil avançou para a entrevista técnica.",
  },
  {
    id: "a2",
    jobId: "j5",
    company: "Vencer Educação",
    role: "Executivo de Relacionamento",
    city: "São Paulo · Remoto",
    salary: "R$ 4.200 – R$ 7.400",
    rating: 4.6,
    stage: 3,
    updated: "Atualizada hoje",
    next: "Proposta em análise pelo RH",
    feedback: "Empresa deu procedência: proposta enviada para aprovação interna.",
  },
  {
    id: "a3",
    jobId: "j6",
    company: "Novalogic",
    role: "Auxiliar de Instalações",
    city: "Curitiba · Presencial",
    salary: "R$ 2.050 – R$ 2.280",
    rating: 3.3,
    stage: 1,
    updated: "Atualizada há 6 dias",
    next: "Triagem de currículo em andamento",
    feedback: "Sem procedência ainda: currículo em fila de triagem.",
  },
];

export const stageNames = ["Inscrição", "Triagem", "Entrevista", "Proposta", "Contratado"];

const defaultPreferences: Preferences = {
  role: "",
  seniority: "Pleno",
  models: ["Híbrido"],
  city: "",
  minSalary: "",
  contracts: ["CLT"],
  availability: "Imediata",
  notifyEmail: true,
  notifyWhats: false,
};

const defaultAccount: Account = {
  name: "Eduardo Marcelo",
  email: "eduardo.marcelo@email.com",
  phone: "(47) 99123-4567",
  photo: null,
};

export function companyFromJob(job: Job): Company {
  return {
    id: `co-${job.company}`,
    name: job.company,
    segment: job.segment,
    rating: job.rating,
    reason: "Você iniciou um processo seletivo",
    since: "agora",
  };
}

export type Recommendation = {
  job: Job;
  score: number;
  reasons: string[];
};

export function scoreJob(
  job: Job,
  ctx: { preferences: Preferences | null; skills: string[]; savedJobs: string[] },
): Recommendation {
  const reasons: string[] = [];
  let score = 40;
  const p = ctx.preferences;

  if (p?.role && job.role.toLowerCase().includes(p.role.trim().toLowerCase())) {
    score += 22;
    reasons.push(`Cargo alinhado com "${p.role}"`);
  }
  if (p?.city && job.city.toLowerCase().includes(p.city.trim().toLowerCase())) {
    score += 12;
    reasons.push(`Na região que você quer (${p.city})`);
  }
  if (p?.models?.some((m) => job.city.toLowerCase().includes(m.toLowerCase()))) {
    score += 10;
    reasons.push("Modelo de trabalho compatível");
  }
  if (p?.contracts?.some((c) => job.tags.includes(c))) {
    score += 6;
    reasons.push("Tipo de contrato desejado");
  }
  if (p?.minSalary) {
    const wanted = Number(p.minSalary.replace(/\D/g, ""));
    const floor = Number((job.salary.match(/[\d.]+/g)?.[0] ?? "0").replace(/\D/g, ""));
    if (wanted && floor >= wanted) {
      score += 12;
      reasons.push("Faixa salarial acima do seu mínimo");
    }
  }
  const matchedSkills = ctx.skills.filter((s) =>
    job.qualifications.concat(job.requirements).some((q) => q.toLowerCase().includes(s.toLowerCase())),
  );
  if (matchedSkills.length) {
    score += Math.min(18, matchedSkills.length * 9);
    reasons.push(`Suas habilidades: ${matchedSkills.slice(0, 2).join(", ")}`);
  }
  if (job.rating >= 4.2) {
    score += 5;
    reasons.push(`Empresa bem avaliada (${job.rating.toFixed(1)})`);
  }
  if (job.quickApply) {
    score += 4;
    reasons.push("Aceita candidatura rápida");
  }
  if (ctx.savedJobs.includes(job.id)) reasons.push("Você salvou esta vaga");

  if (!reasons.length) reasons.push("Compatível com o seu histórico no Candidatu");
  return { job, score: Math.max(35, Math.min(98, score)), reasons: reasons.slice(0, 3) };
}

type Store = {
  account: Account;
  setAccount: (a: Account) => void;
  savedJobs: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  applications: Application[];
  applyToJob: (job: Job, extra?: { letter?: string; qualifications?: string[] }) => void;
  withdraw: (id: string) => void;
  advance: (id: string) => void;
  hasApplied: (jobId: string) => boolean;
  followed: Company[];
  toggleFollow: (c: Company) => void;
  isFollowing: (id: string) => boolean;
  preferences: Preferences | null;
  savePreferences: (p: Preferences) => void;
  defaultPreferences: Preferences;
  deleteAccount: () => void;
  activity: Activity[];
  logActivity: (kind: ActivityKind, title: string, detail: string) => void;
  clearActivity: () => void;
  alerts: JobAlert[];
  unreadAlerts: number;
  markAlertsRead: () => void;
  dismissAlert: (id: string) => void;
  resume: Resume | null;
  saveResume: (r: Resume) => void;
  skills: string[];
  setSkills: (s: string[]) => void;
  recommendations: Recommendation[];
};

const StoreContext = createContext<Store | null>(null);

const KEY = "candidatu-app-state";

function nowIso() {
  return new Date().toISOString();
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account>(defaultAccount);
  const [savedJobs, setSavedJobs] = useState<string[]>(["j1", "j3"]);
  const [applications, setApplications] = useState<Application[]>(seedApplications);
  const [followed, setFollowed] = useState<Company[]>([
    {
      id: "co-Nuvem Log",
      name: "Nuvem Log",
      segment: "Logística · 240 pessoas",
      rating: 4.2,
      reason: "Você iniciou um processo seletivo",
      since: "há 12 dias",
    },
    {
      id: "co-Vencer Educação",
      name: "Vencer Educação",
      segment: "Educação · 1.100 pessoas",
      rating: 4.6,
      reason: "Você avaliou o processo com 5 estrelas",
      since: "há 3 dias",
    },
  ]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [skills, setSkills] = useState<string[]>(["Excel avançado", "Inglês intermediário"]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (p["account"]) setAccount(p["account"] as Account);
      if (p["savedJobs"]) setSavedJobs(p["savedJobs"] as string[]);
      if (p["applications"]) setApplications(p["applications"] as Application[]);
      if (p["followed"]) setFollowed(p["followed"] as Company[]);
      if (p["preferences"]) setPreferences(p["preferences"] as Preferences);
      if (p["activity"]) setActivity(p["activity"] as Activity[]);
      if (p["alerts"]) setAlerts(p["alerts"] as JobAlert[]);
      if (p["resume"]) setResume(p["resume"] as Resume);
      if (p["skills"]) setSkills(p["skills"] as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          account,
          savedJobs,
          applications,
          followed,
          preferences,
          activity,
          alerts,
          resume,
          skills,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [account, savedJobs, applications, followed, preferences, activity, alerts, resume, skills]);

  const logActivity = useCallback((kind: ActivityKind, title: string, detail: string) => {
    setActivity((prev) =>
      [
        { id: `ac-${kind}-${Date.now()}-${Math.round(Math.random() * 1e4)}`, kind, title, detail, at: nowIso() },
        ...prev,
      ].slice(0, 80),
    );
  }, []);

  const toggleSaved = useCallback(
    (id: string) => {
      const job = jobPool.find((j) => j.id === id);
      setSavedJobs((prev) => {
        const has = prev.includes(id);
        logActivity(
          "salvar",
          has ? "Vaga removida das salvas" : "Vaga salva",
          job ? `${job.role} · ${job.company}` : id,
        );
        return has ? prev.filter((x) => x !== id) : [...prev, id];
      });
    },
    [logActivity],
  );

  const toggleFollow = useCallback(
    (c: Company) => {
      setFollowed((prev) => {
        const has = prev.some((x) => x.id === c.id);
        logActivity(
          "seguir",
          has ? "Deixou de seguir empresa" : "Começou a seguir empresa",
          `${c.name} · ${c.segment}`,
        );
        return has ? prev.filter((x) => x.id !== c.id) : [...prev, c];
      });
    },
    [logActivity],
  );

  const applyToJob = useCallback(
    (job: Job, extra?: { letter?: string; qualifications?: string[] }) => {
      setApplications((prev) => {
        if (prev.some((a) => a.jobId === job.id)) return prev;
        return [
          {
            id: `app-${job.id}-${Date.now()}`,
            jobId: job.id,
            company: job.company,
            role: job.role,
            city: job.city,
            salary: job.salary,
            rating: job.rating,
            stage: 0,
            updated: "Enviada agora",
            next: "Aguardando triagem do currículo pela empresa",
            feedback: "Candidatura enviada: a empresa recebeu seu currículo.",
            letter: extra?.letter ?? "",
            qualifications: extra?.qualifications ?? [],
            events: [
              {
                id: `ev-${Date.now()}`,
                label: "Candidatura enviada",
                note: `Currículo e dados de contato enviados para ${job.company}.`,
                at: nowIso(),
              },
            ],
          },
          ...prev,
        ];
      });
      setFollowed((prev) => {
        const c = companyFromJob(job);
        return prev.some((x) => x.id === c.id) ? prev : [...prev, c];
      });
      logActivity("candidatura", "Candidatura enviada", `${job.role} · ${job.company}`);
    },
    [logActivity],
  );

  const withdraw = useCallback(
    (id: string) => {
      setApplications((prev) => {
        const a = prev.find((x) => x.id === id);
        if (a) logActivity("candidatura", "Candidatura retirada", `${a.role} · ${a.company}`);
        return prev.filter((x) => x.id !== id);
      });
    },
    [logActivity],
  );

  const advance = useCallback(
    (id: string) => {
      setApplications((prev) =>
        prev.map((a) => {
          if (a.id !== id || a.stage >= stageNames.length - 1) return a;
          const next = stageNames[a.stage + 1]!;
          logActivity("etapa", `Avanço para ${next}`, `${a.role} · ${a.company}`);
          return {
            ...a,
            stage: a.stage + 1,
            updated: "Atualizada agora",
            next: `Etapa atual: ${next}`,
            feedback: `Empresa deu procedência: seu perfil avançou para ${next}.`,
            events: [
              ...(a.events ?? []),
              {
                id: `ev-${Date.now()}`,
                label: `Etapa: ${next}`,
                note: `${a.company} registrou procedência e avançou seu processo.`,
                at: nowIso(),
              },
            ],
          };
        }),
      );
    },
    [logActivity],
  );

  const savePreferences = useCallback(
    (p: Preferences) => {
      setPreferences(p);
      logActivity(
        "preferencias",
        "Preferências de vagas atualizadas",
        `${p.role || "Qualquer cargo"} · ${p.city || "Qualquer cidade"} · ${p.models.join(", ")}`,
      );
    },
    [logActivity],
  );

  const saveResume = useCallback(
    (r: Resume) => {
      setResume(r);
      setSkills((prev) => Array.from(new Set([...prev, ...r.skills])).slice(0, 20));
      logActivity("curriculo", "Currículo gerado com IA", r.headline);
    },
    [logActivity],
  );

  const recommendations = useMemo(() => {
    return jobPool
      .map((j) => scoreJob(j, { preferences, skills, savedJobs }))
      .sort((a, b) => b.score - a.score);
  }, [preferences, skills, savedJobs]);

  // Alertas em tempo real: monitora vagas compatíveis ainda não avisadas.
  useEffect(() => {
    const tick = () => {
      const candidate = recommendations.find(
        (r) => r.score >= 70 && !alerts.some((al) => al.jobId === r.job.id),
      );
      if (!candidate) return;
      const alert: JobAlert = {
        id: `al-${candidate.job.id}-${Date.now()}`,
        jobId: candidate.job.id,
        title: `${candidate.score}% de match: ${candidate.job.role}`,
        detail: `${candidate.job.company} · ${candidate.job.city} · ${candidate.job.salary}`,
        at: nowIso(),
        read: false,
      };
      setAlerts((prev) => [alert, ...prev].slice(0, 30));
      setActivity((prev) =>
        [
          {
            id: `ac-alerta-${Date.now()}`,
            kind: "alerta" as ActivityKind,
            title: "Alerta de vaga compatível",
            detail: `${candidate.job.role} · ${candidate.job.company}`,
            at: nowIso(),
          },
          ...prev,
        ].slice(0, 80),
      );
    };
    const first = window.setTimeout(tick, 4000);
    const interval = window.setInterval(tick, 20000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [recommendations, alerts]);

  const value = useMemo<Store>(
    () => ({
      account,
      setAccount: (a: Account) => {
        setAccount(a);
        logActivity("perfil", "Dados da conta atualizados", a.email);
      },
      savedJobs,
      toggleSaved,
      isSaved: (id) => savedJobs.includes(id),
      applications,
      applyToJob,
      withdraw,
      advance,
      hasApplied: (jobId) => applications.some((a) => a.jobId === jobId),
      followed,
      toggleFollow,
      isFollowing: (id) => followed.some((c) => c.id === id),
      preferences,
      savePreferences,
      defaultPreferences,
      deleteAccount: () => {
        try {
          localStorage.removeItem(KEY);
        } catch {
          /* ignore */
        }
      },
      activity,
      logActivity,
      clearActivity: () => setActivity([]),
      alerts,
      unreadAlerts: alerts.filter((a) => !a.read).length,
      markAlertsRead: () => setAlerts((prev) => prev.map((a) => ({ ...a, read: true }))),
      dismissAlert: (id) => setAlerts((prev) => prev.filter((a) => a.id !== id)),
      resume,
      saveResume,
      skills,
      setSkills,
      recommendations,
    }),
    [
      account,
      savedJobs,
      toggleSaved,
      applications,
      applyToJob,
      withdraw,
      advance,
      followed,
      toggleFollow,
      preferences,
      savePreferences,
      activity,
      logActivity,
      alerts,
      resume,
      saveResume,
      skills,
      recommendations,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore precisa estar dentro de AppStoreProvider");
  return ctx;
}

