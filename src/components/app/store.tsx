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
};

export type Application = {
  id: string;
  company: string;
  role: string;
  city: string;
  salary: string;
  rating: number;
  stage: number;
  updated: string;
  next: string;
  feedback: string;
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
  },
];

export const applications: Application[] = [
  {
    id: "a1",
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
  {
    id: "a4",
    company: "Grupo TBX",
    role: "Coordenador de Operações",
    city: "Joinville · Híbrido",
    salary: "R$ 6.100 – R$ 8.000",
    rating: 4.4,
    stage: 4,
    updated: "Finalizada há 1 dia",
    next: "Contratação confirmada",
    feedback: "Processo concluído: você foi aprovado e recebeu carta-proposta.",
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

type Store = {
  account: Account;
  setAccount: (a: Account) => void;
  savedJobs: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  followed: Company[];
  toggleFollow: (c: Company) => void;
  isFollowing: (id: string) => boolean;
  preferences: Preferences | null;
  savePreferences: (p: Preferences) => void;
  defaultPreferences: Preferences;
  deleted: boolean;
  deleteAccount: () => void;
};

const StoreContext = createContext<Store | null>(null);

const KEY = "candidatu-app-state";

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account>(defaultAccount);
  const [savedJobs, setSavedJobs] = useState<string[]>(["j1", "j3"]);
  const [followed, setFollowed] = useState<Company[]>([
    {
      id: "c1",
      name: "Nuvem Log",
      segment: "Logística · 240 pessoas",
      rating: 4.2,
      reason: "Você iniciou um processo seletivo",
      since: "há 12 dias",
    },
    {
      id: "c2",
      name: "Vencer Educação",
      segment: "Educação · 1.100 pessoas",
      rating: 4.6,
      reason: "Você avaliou o processo com 5 estrelas",
      since: "há 3 dias",
    },
  ]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as Partial<Store>;
      if (p.account) setAccount(p.account as Account);
      if (p.savedJobs) setSavedJobs(p.savedJobs as string[]);
      if (p.followed) setFollowed(p.followed as Company[]);
      if (p.preferences) setPreferences(p.preferences as Preferences);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ account, savedJobs, followed, preferences }),
      );
    } catch {
      /* ignore */
    }
  }, [account, savedJobs, followed, preferences]);

  const toggleSaved = useCallback((id: string) => {
    setSavedJobs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleFollow = useCallback((c: Company) => {
    setFollowed((prev) =>
      prev.some((x) => x.id === c.id) ? prev.filter((x) => x.id !== c.id) : [...prev, c],
    );
  }, []);

  const value = useMemo<Store>(
    () => ({
      account,
      setAccount,
      savedJobs,
      toggleSaved,
      isSaved: (id) => savedJobs.includes(id),
      followed,
      toggleFollow,
      isFollowing: (id) => followed.some((c) => c.id === id),
      preferences,
      savePreferences: setPreferences,
      defaultPreferences,
      deleted,
      deleteAccount: () => {
        setDeleted(true);
        try {
          localStorage.removeItem(KEY);
        } catch {
          /* ignore */
        }
      },
    }),
    [account, savedJobs, toggleSaved, followed, toggleFollow, preferences, deleted],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore precisa estar dentro de AppStoreProvider");
  return ctx;
}
