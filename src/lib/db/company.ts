import { supabase } from "@/integrations/supabase/client";
import type { Candidate, Stage, Vacancy } from "@/components/company/store";
import { stages } from "@/components/company/store";
import { fetchCompanyVacancies, type VacancyRow } from "./vacancies";

export type CompanyRow = {
  id: string;
  owner_id: string;
  name: string;
  segment: string;
  about: string;
  website: string | null;
  city: string;
  logo_url: string | null;
};

/** Empresa da pessoa logada (dona ou integrante da equipe). */
export async function fetchMyCompany(userId: string): Promise<CompanyRow | null> {
  const own = await supabase
    .from("companies")
    .select("id, owner_id, name, segment, about, website, city, logo_url")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();
  if (own.data) return own.data as CompanyRow;

  const member = await supabase
    .from("company_members")
    .select("company_id, companies(id, owner_id, name, segment, about, website, city, logo_url)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  const co = member.data?.companies as CompanyRow | null | undefined;
  return co ?? null;
}

export async function createCompany(
  userId: string,
  input: { name: string; segment: string; city: string; about?: string; website?: string },
) {
  const { data, error } = await supabase
    .from("companies")
    .insert({
      owner_id: userId,
      name: input.name,
      segment: input.segment,
      city: input.city,
      about: input.about ?? "",
      website: input.website ?? null,
    })
    .select("id, owner_id, name, segment, about, website, city, logo_url")
    .single();
  if (error) throw error;
  await supabase
    .from("company_members")
    .insert({ company_id: data.id, user_id: userId, role: "admin" });
  return data as CompanyRow;
}

export async function updateCompany(companyId: string, patch: Partial<CompanyRow>) {
  const { error } = await supabase.from("companies").update(patch).eq("id", companyId);
  if (error) throw error;
}

/* ---------------- vagas ---------------- */

const statusToDb: Record<Vacancy["status"], "publicada" | "rascunho" | "encerrada"> = {
  Publicada: "publicada",
  Pausada: "rascunho",
  Encerrada: "encerrada",
};
const statusFromDb: Record<string, Vacancy["status"]> = {
  publicada: "Publicada",
  rascunho: "Pausada",
  encerrada: "Encerrada",
};

export function rowToVacancy(v: VacancyRow): Vacancy {
  const out: Vacancy = {
    id: v.id,
    role: v.title,
    area: v.segment,
    city: v.city,
    model: (v.work_model || "Presencial") as Vacancy["model"],
    contract: (v.type === "freelance" ? "PJ" : v.contract || "CLT") as Vacancy["contract"],
    salaryMin: Number(v.salary_min ?? 0),
    salaryMax: Number(v.salary_max ?? 0),
    seniority: (v.seniority || "Pleno") as Vacancy["seniority"],
    status: statusFromDb[v.status] ?? "Pausada",
    openings: 1,
    published: new Date(v.published_at ?? v.created_at).toLocaleDateString("pt-BR"),
    publishedAt: v.published_at ?? v.created_at,
    skills: v.requirements,
    description: v.about,
    type: v.type === "freelance" ? "Freelance" : "Contratual",
  };
  if (v.daily_rate != null) out.dailyRate = Number(v.daily_rate);
  if (v.shift_hours) out.hours = v.shift_hours;
  if (v.type === "freelance" && v.contract) out.period = v.contract;
  if (v.contact_email) out.contact = v.contact_email;
  return out;
}

export async function loadCompanyVacancies(companyId: string): Promise<Vacancy[]> {
  return (await fetchCompanyVacancies(companyId)).map(rowToVacancy);
}

export async function createVacancy(
  companyId: string,
  userId: string,
  v: Omit<Vacancy, "id" | "published" | "status">,
) {
  const freelance = v.type === "Freelance";
  const { data, error } = await supabase
    .from("vacancies")
    .insert({
      company_id: companyId,
      created_by: userId,
      title: v.role,
      type: freelance ? "freelance" : "contratual",
      status: "publicada",
      city: v.city,
      work_model: v.model,
      seniority: v.seniority,
      segment: v.area,
      salary_min: v.salaryMin || null,
      salary_max: v.salaryMax || null,
      daily_rate: freelance ? (v.dailyRate ?? null) : null,
      shift_hours: freelance ? (v.hours ?? null) : null,
      contract: freelance ? (v.period ?? "") : v.contract,
      about: v.description,
      requirements: v.skills,
      tags: freelance ? [v.area, ...v.skills].slice(0, 4) : [v.contract, v.model, v.seniority],
      contact_email: v.contact ?? null,
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function setVacancyStatusDb(id: string, status: Vacancy["status"]) {
  const { error } = await supabase
    .from("vacancies")
    .update({ status: statusToDb[status] })
    .eq("id", id);
  if (error) throw error;
}

export async function removeVacancyDb(id: string) {
  const { error } = await supabase.from("vacancies").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------- candidaturas recebidas ---------------- */

const tones = ["bg-primary", "bg-accent", "bg-ink", "bg-primary/80", "bg-accent/80"];

type CompanyApplicationRow = {
  id: string;
  vacancy_id: string;
  candidate_id: string;
  stage: number;
  status: string;
  qualifications: string[];
  letter: string;
  created_at: string;
  profiles: { name: string; occupation: string | null } | null;
};

export async function loadCompanyCandidates(companyId: string): Promise<Candidate[]> {
  const { data: vac } = await supabase.from("vacancies").select("id").eq("company_id", companyId);
  const ids = (vac ?? []).map((v) => v.id);
  if (!ids.length) return [];

  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, vacancy_id, candidate_id, stage, status, qualifications, letter, created_at, profiles:candidate_id(name, occupation)",
    )
    .in("vacancy_id", ids)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return ((data ?? []) as unknown as CompanyApplicationRow[]).map((a, i) => ({
    id: a.id,
    vacancyId: a.vacancy_id,
    name: a.profiles?.name || "Candidato",
    headline: a.profiles?.occupation || "Perfil sem título profissional",
    city: "",
    model: "Presencial",
    salaryExpectation: 0,
    experience: 0,
    skills: a.qualifications,
    score: 0,
    stage: (stages[Math.min(a.stage, stages.length - 1)] ?? stages[0]) as Stage,
    appliedAt: a.created_at,
    avatarTone: tones[i % tones.length]!,
    favorite: false,
    ...(a.status === "reprovada" || a.status === "desistiu" ? { rejected: true } : {}),
    notes: [],
    timeline: [{ id: `${a.id}-in`, label: "Candidatura recebida", at: a.created_at }],
  }));
}

export async function moveApplicationStage(applicationId: string, stage: Stage) {
  const index = stages.indexOf(stage);
  const contratado = stage === "Contratado";
  const { error } = await supabase
    .from("applications")
    .update({
      stage: index,
      status: contratado ? "contratada" : "ativa",
      next_step: contratado ? "Contratação confirmada" : `Etapa atual: ${stage}`,
      feedback: contratado
        ? "Você foi aprovada(o) no processo!"
        : `A empresa registrou avanço para ${stage}.`,
    })
    .eq("id", applicationId);
  if (error) throw error;
  await addApplicationEvent(applicationId, `Etapa: ${stage}`, "A empresa registrou avanço no processo.");
}

export async function rejectApplication(applicationId: string, feedback: string) {
  const { error } = await supabase
    .from("applications")
    .update({ status: "reprovada", next_step: "Processo encerrado", feedback })
    .eq("id", applicationId);
  if (error) throw error;
  await addApplicationEvent(applicationId, "Processo encerrado", feedback);
}

export async function restoreApplication(applicationId: string) {
  const { error } = await supabase
    .from("applications")
    .update({ status: "ativa", next_step: "Processo reativado", feedback: "" })
    .eq("id", applicationId);
  if (error) throw error;
  await addApplicationEvent(applicationId, "Processo reativado", "A empresa retomou sua candidatura.");
}

export async function addApplicationEvent(applicationId: string, label: string, note: string) {
  const { error } = await supabase
    .from("application_events")
    .insert({ application_id: applicationId, label, note });
  if (error) throw error;
}
