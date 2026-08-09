import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchJobs, fetchVacancyById } from "@/lib/db/vacancies";
import {
  clearActivitiesDb,
  createApplication,
  fetchActivities,
  fetchApplications,
  fetchFollowed,
  fetchPreferences,
  fetchResume,
  fetchSaved,
  logActivityDb,
  savePreferencesDb,
  saveResumeDb,
  setFollowed as setFollowedDb,
  setSaved as setSavedDb,
  updateAccount,
  withdrawApplication,
} from "@/lib/db/candidate";

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
  occupation?: string;
  username?: string;
  termsAcceptedAt?: string | null;
  onboardedAt?: string | null;
};

export const stageNames = ["Inscrição", "Triagem", "Entrevista", "Proposta", "Contratado"];

export const defaultPreferences: Preferences = {
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

const emptyAccount: Account = {
  name: "",
  email: "",
  phone: "",
  photo: null,
  occupation: "",
  username: "",
  termsAcceptedAt: null,
  onboardedAt: null,
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
  loading: boolean;
  authenticated: boolean;
  reload: () => void;
  jobs: Job[];
  account: Account;
  setAccount: (a: Account) => void;
  savedJobs: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  applications: Application[];
  applyToJob: (job: Job, extra?: { letter?: string; qualifications?: string[] }) => void;
  withdraw: (id: string) => void;
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

function nowIso() {
  return new Date().toISOString();
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const authenticated = !!user;

  const [account, setAccountState] = useState<Account>(emptyAccount);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [followed, setFollowed] = useState<Company[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [readAlerts, setReadAlerts] = useState<string[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (profile) {
      setAccountState({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        photo: profile.photo_url,
        occupation: profile.occupation ?? "",
        username: profile.username ?? "",
        termsAcceptedAt: profile.terms_accepted_at,
        onboardedAt: profile.onboarded_at,
      });
    } else {
      setAccountState(emptyAccount);
    }
  }, [profile]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const jobsData = await fetchJobs().catch(() => []);
      if (!active) return;
      setJobs(jobsData);

      if (!user) {
        setSavedJobs([]);
        setApplications([]);
        setFollowed([]);
        setPreferences(null);
        setActivity([]);
        setResume(null);
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      const [apps, saved, followedList, prefs, res, acts] = await Promise.all([
        fetchApplications(user.id).catch(() => []),
        fetchSaved(user.id).catch(() => []),
        fetchFollowed(user.id).catch(() => []),
        fetchPreferences(user.id).catch(() => null),
        fetchResume(user.id).catch(() => null),
        fetchActivities(user.id).catch(() => []),
      ]);
      if (!active) return;
      setApplications(apps);
      setSavedJobs(saved);
      setFollowed(followedList);
      setPreferences(prefs);
      setResume(res);
      setActivity(acts);
      setDataLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const logActivity = useCallback(
    (kind: ActivityKind, title: string, detail: string) => {
      if (!user) return;
      const tempId = `local-${kind}-${Date.now()}-${Math.round(Math.random() * 1e4)}`;
      setActivity((prev) => [{ id: tempId, kind, title, detail, at: nowIso() }, ...prev].slice(0, 80));
      void logActivityDb(user.id, kind, title, detail)
        .then((r) => {
          if (!r) return;
          setActivity((prev) =>
            prev.map((a) => (a.id === tempId ? { ...a, id: r.id, at: r.created_at } : a)),
          );
        })
        .catch(() => {
          /* ignore */
        });
    },
    [user],
  );

  const setAccount = useCallback(
    (a: Account) => {
      if (!user) return;
      setAccountState(a);
      void updateAccount(user.id, a)
        .then(() => {
          logActivity("perfil", "Dados da conta atualizados", a.email);
          void refreshProfile();
        })
        .catch(() => {
          /* ignore */
        });
    },
    [user, logActivity, refreshProfile],
  );

  const toggleSaved = useCallback(
    (id: string) => {
      if (!user) return;
      const has = savedJobs.includes(id);
      const job = jobs.find((j) => j.id === id);
      setSavedJobs((prev) => (has ? prev.filter((x) => x !== id) : [...prev, id]));
      logActivity(
        "salvar",
        has ? "Vaga removida das salvas" : "Vaga salva",
        job ? `${job.role} · ${job.company}` : id,
      );
      void setSavedDb(user.id, id, !has).catch(() => {
        /* ignore */
      });
    },
    [user, savedJobs, jobs, logActivity],
  );

  const toggleFollow = useCallback(
    (c: Company) => {
      if (!user) return;
      const has = followed.some((x) => x.id === c.id);
      setFollowed((prev) => (has ? prev.filter((x) => x.id !== c.id) : [...prev, c]));
      logActivity(
        "seguir",
        has ? "Deixou de seguir empresa" : "Começou a seguir empresa",
        `${c.name} · ${c.segment}`,
      );
      void setFollowedDb(user.id, c.id, !has, c.reason).catch(() => {
        /* ignore */
      });
    },
    [user, followed, logActivity],
  );

  const applyToJob = useCallback(
    (job: Job, extra?: { letter?: string; qualifications?: string[] }) => {
      if (!user) return;
      if (applications.some((a) => a.jobId === job.id)) return;
      void (async () => {
        try {
          await createApplication(user.id, job.id, extra);
          const vacancy = await fetchVacancyById(job.id).catch(() => null);
          if (vacancy) {
            const c = companyFromJob(job);
            await setFollowedDb(user.id, vacancy.company_id, true, c.reason).catch(() => {
              /* ignore */
            });
            setFollowed((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c]));
          }
          logActivity("candidatura", "Candidatura enviada", `${job.role} · ${job.company}`);
          const apps = await fetchApplications(user.id).catch(() => []);
          setApplications(apps);
        } catch {
          /* ignore */
        }
      })();
    },
    [user, applications, logActivity],
  );

  const withdraw = useCallback(
    (id: string) => {
      if (!user) return;
      const a = applications.find((x) => x.id === id);
      void (async () => {
        try {
          await withdrawApplication(id);
          if (a) logActivity("candidatura", "Candidatura retirada", `${a.role} · ${a.company}`);
          const apps = await fetchApplications(user.id).catch(() => []);
          setApplications(apps);
        } catch {
          /* ignore */
        }
      })();
    },
    [user, applications, logActivity],
  );

  const savePreferences = useCallback(
    (p: Preferences) => {
      if (!user) return;
      setPreferences(p);
      logActivity(
        "preferencias",
        "Preferências de vagas atualizadas",
        `${p.role || "Qualquer cargo"} · ${p.city || "Qualquer cidade"} · ${p.models.join(", ")}`,
      );
      void savePreferencesDb(user.id, p).catch(() => {
        /* ignore */
      });
    },
    [user, logActivity],
  );

  const saveResume = useCallback(
    (r: Resume) => {
      if (!user) return;
      setResume(r);
      logActivity("curriculo", "Currículo gerado com IA", r.headline);
      void saveResumeDb(user.id, r).catch(() => {
        /* ignore */
      });
    },
    [user, logActivity],
  );

  const setSkills = useCallback(
    (s: string[]) => {
      if (!user || !resume) return;
      const updated: Resume = { ...resume, skills: s };
      setResume(updated);
      void saveResumeDb(user.id, updated).catch(() => {
        /* ignore */
      });
    },
    [user, resume],
  );

  const skills = useMemo(() => resume?.skills ?? [], [resume]);

  const recommendations = useMemo(() => {
    return jobs
      .map((j) => scoreJob(j, { preferences, skills, savedJobs }))
      .sort((a, b) => b.score - a.score);
  }, [jobs, preferences, skills, savedJobs]);

  const alerts = useMemo<JobAlert[]>(() => {
    return recommendations
      .filter((r) => r.score >= 70 && !dismissedAlerts.includes(r.job.id))
      .slice(0, 10)
      .map((r) => ({
        id: `al-${r.job.id}`,
        jobId: r.job.id,
        title: `${r.score}% de match: ${r.job.role}`,
        detail: `${r.job.company} · ${r.job.city} · ${r.job.salary}`,
        at: nowIso(),
        read: readAlerts.includes(r.job.id),
      }));
  }, [recommendations, dismissedAlerts, readAlerts]);

  const markAlertsRead = useCallback(() => {
    setReadAlerts((prev) => Array.from(new Set([...prev, ...alerts.map((a) => a.jobId)])));
  }, [alerts]);

  const dismissAlert = useCallback(
    (id: string) => {
      const a = alerts.find((x) => x.id === id);
      if (a) setDismissedAlerts((prev) => [...prev, a.jobId]);
    },
    [alerts],
  );

  const clearActivity = useCallback(() => {
    if (!user) return;
    setActivity([]);
    void clearActivitiesDb(user.id).catch(() => {
      /* ignore */
    });
  }, [user]);

  const deleteAccount = useCallback(() => {
    void supabase.auth.signOut();
    setAccountState(emptyAccount);
    setSavedJobs([]);
    setApplications([]);
    setFollowed([]);
    setPreferences(null);
    setActivity([]);
    setResume(null);
  }, []);

  const loading = authLoading || dataLoading;

  const value = useMemo<Store>(
    () => ({
      loading,
      authenticated,
      reload,
      jobs,
      account,
      setAccount,
      savedJobs,
      toggleSaved,
      isSaved: (id) => savedJobs.includes(id),
      applications,
      applyToJob,
      withdraw,
      hasApplied: (jobId) => applications.some((a) => a.jobId === jobId),
      followed,
      toggleFollow,
      isFollowing: (id) => followed.some((c) => c.id === id),
      preferences,
      savePreferences,
      defaultPreferences,
      deleteAccount,
      activity,
      logActivity,
      clearActivity,
      alerts,
      unreadAlerts: alerts.filter((a) => !a.read).length,
      markAlertsRead,
      dismissAlert,
      resume,
      saveResume,
      skills,
      setSkills,
      recommendations,
    }),
    [
      loading,
      authenticated,
      reload,
      jobs,
      account,
      setAccount,
      savedJobs,
      toggleSaved,
      applications,
      applyToJob,
      withdraw,
      followed,
      toggleFollow,
      preferences,
      savePreferences,
      deleteAccount,
      activity,
      logActivity,
      clearActivity,
      alerts,
      markAlertsRead,
      dismissAlert,
      resume,
      saveResume,
      skills,
      setSkills,
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
