import { supabase } from "@/integrations/supabase/client";
import type {
  Account,
  Activity,
  ActivityKind,
  Application,
  Company,
  Preferences,
  Resume,
} from "@/components/app/store";
import { rowToJob, type VacancyRow } from "./vacancies";

const APP_SELECT =
  "id, vacancy_id, stage, status, letter, qualifications, next_step, feedback, updated_at, created_at, vacancies(id, company_id, title, type, status, city, work_model, seniority, segment, salary_min, salary_max, salary_text, daily_rate, shift_hours, work_date, contract, about, responsibilities, requirements, benefits, qualifications, tags, quick_apply, contact_email, published_at, created_at, companies(name, segment)), application_events(id, label, note, created_at)";

function relative(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Atualizada hoje";
  if (days === 1) return "Atualizada ontem";
  return `Atualizada há ${days} dias`;
}

type ApplicationRow = {
  id: string;
  vacancy_id: string;
  stage: number;
  status: string;
  letter: string;
  qualifications: string[];
  next_step: string;
  feedback: string;
  updated_at: string;
  created_at: string;
  vacancies: VacancyRow | null;
  application_events: { id: string; label: string; note: string; created_at: string }[] | null;
};

function rowToApplication(row: ApplicationRow): Application {
  const job = row.vacancies ? rowToJob(row.vacancies) : null;
  return {
    id: row.id,
    jobId: row.vacancy_id,
    company: job?.company ?? "Empresa",
    role: job?.role ?? "Vaga removida",
    city: job?.city ?? "",
    salary: job?.salary ?? "",
    rating: 0,
    stage: row.stage,
    updated: relative(row.updated_at),
    next: row.next_step,
    feedback: row.feedback,
    letter: row.letter,
    qualifications: row.qualifications,
    events: (row.application_events ?? [])
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((e) => ({ id: e.id, label: e.label, note: e.note, at: e.created_at })),
  };
}

/* ---------------- perfil ---------------- */

export async function updateAccount(userId: string, account: Account) {
  const { error } = await supabase
    .from("profiles")
    .update({
      name: account.name,
      email: account.email,
      phone: account.phone,
      photo_url: account.photo,
      occupation: account.occupation ?? null,
      username: account.username || null,
      terms_accepted_at: account.termsAcceptedAt ?? null,
      onboarded_at: account.onboardedAt ?? null,
    })
    .eq("id", userId);
  if (error) throw error;
}

/* ---------------- preferências ---------------- */

export async function fetchPreferences(userId: string): Promise<Preferences | null> {
  const { data } = await supabase
    .from("job_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    role: data.role,
    seniority: data.seniority,
    models: data.models,
    city: data.city,
    minSalary: data.min_salary,
    contracts: data.contracts,
    availability: data.availability,
    notifyEmail: data.notify_email,
    notifyWhats: data.notify_whats,
  };
}

export async function savePreferencesDb(userId: string, p: Preferences) {
  const { error } = await supabase.from("job_preferences").upsert({
    user_id: userId,
    role: p.role,
    seniority: p.seniority,
    models: p.models,
    city: p.city,
    min_salary: p.minSalary,
    contracts: p.contracts,
    availability: p.availability,
    notify_email: p.notifyEmail,
    notify_whats: p.notifyWhats,
  });
  if (error) throw error;
}

/* ---------------- currículo ---------------- */

export async function fetchResume(userId: string): Promise<Resume | null> {
  const { data } = await supabase.from("resumes").select("*").eq("user_id", userId).maybeSingle();
  if (!data) return null;
  return {
    headline: data.headline,
    summary: data.summary,
    experiences: (data.experiences ?? []) as Resume["experiences"],
    skills: data.skills,
    education: data.education,
    createdAt: data.created_at,
  };
}

export async function saveResumeDb(userId: string, r: Resume) {
  const { error } = await supabase.from("resumes").upsert({
    user_id: userId,
    headline: r.headline,
    summary: r.summary,
    experiences: r.experiences,
    skills: r.skills,
    education: r.education,
  });
  if (error) throw error;
}

/* ---------------- candidaturas ---------------- */

export async function fetchApplications(userId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select(APP_SELECT)
    .eq("candidate_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as ApplicationRow[]).map(rowToApplication);
}

export async function createApplication(
  userId: string,
  vacancyId: string,
  extra?: { letter?: string; qualifications?: string[] },
) {
  const { data, error } = await supabase
    .from("applications")
    .insert({
      candidate_id: userId,
      vacancy_id: vacancyId,
      letter: extra?.letter ?? "",
      qualifications: extra?.qualifications ?? [],
      next_step: "Aguardando triagem do currículo pela empresa",
      feedback: "Candidatura enviada: a empresa recebeu seu currículo.",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function withdrawApplication(id: string) {
  const { error } = await supabase
    .from("applications")
    .update({ status: "desistiu", next_step: "Você desistiu do processo", feedback: "" })
    .eq("id", id);
  if (error) throw error;
}

/* ---------------- vagas salvas ---------------- */

export async function fetchSaved(userId: string) {
  const { data, error } = await supabase
    .from("saved_vacancies")
    .select("vacancy_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.vacancy_id);
}

export async function setSaved(userId: string, vacancyId: string, saved: boolean) {
  if (saved) {
    const { error } = await supabase
      .from("saved_vacancies")
      .upsert({ user_id: userId, vacancy_id: vacancyId }, { onConflict: "user_id,vacancy_id" });
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from("saved_vacancies")
    .delete()
    .eq("user_id", userId)
    .eq("vacancy_id", vacancyId);
  if (error) throw error;
}

/* ---------------- empresas seguidas ---------------- */

export async function fetchFollowed(userId: string): Promise<Company[]> {
  const { data, error } = await supabase
    .from("followed_companies")
    .select("company_id, reason, created_at, companies(name, segment)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => {
    const co = r.companies as { name: string; segment: string } | null;
    return {
      id: r.company_id,
      name: co?.name ?? "Empresa",
      segment: co?.segment ?? "",
      rating: 0,
      reason: r.reason,
      since: new Date(r.created_at).toLocaleDateString("pt-BR"),
    };
  });
}

export async function setFollowed(
  userId: string,
  companyId: string,
  follow: boolean,
  reason = "Você acompanha esta empresa",
) {
  if (follow) {
    const { error } = await supabase
      .from("followed_companies")
      .upsert({ user_id: userId, company_id: companyId, reason }, { onConflict: "user_id,company_id" });
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from("followed_companies")
    .delete()
    .eq("user_id", userId)
    .eq("company_id", companyId);
  if (error) throw error;
}

/* ---------------- histórico ---------------- */

export async function fetchActivities(userId: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("id, kind, title, detail, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(80);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    kind: r.kind as ActivityKind,
    title: r.title,
    detail: r.detail,
    at: r.created_at,
  }));
}

export async function logActivityDb(
  userId: string,
  kind: ActivityKind,
  title: string,
  detail: string,
) {
  const { data, error } = await supabase
    .from("activities")
    .insert({ user_id: userId, kind, title, detail })
    .select("id, created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function clearActivitiesDb(userId: string) {
  const { error } = await supabase.from("activities").delete().eq("user_id", userId);
  if (error) throw error;
}
