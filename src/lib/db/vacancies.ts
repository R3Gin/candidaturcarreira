import { supabase } from "@/integrations/supabase/client";
import type { Job } from "@/components/app/store";
import type { Freela } from "@/lib/freelas";

export type VacancyRow = {
  id: string;
  company_id: string;
  title: string;
  type: "contratual" | "freelance";
  status: "rascunho" | "publicada" | "encerrada";
  city: string;
  work_model: string;
  seniority: string;
  segment: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_text: string;
  daily_rate: number | null;
  shift_hours: string | null;
  work_date: string | null;
  contract: string;
  about: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  qualifications: string[];
  tags: string[];
  quick_apply: boolean;
  contact_email: string | null;
  published_at: string | null;
  created_at: string;
  companies?: { name: string; segment: string } | null;
};

const SELECT =
  "id, company_id, title, type, status, city, work_model, seniority, segment, salary_min, salary_max, salary_text, daily_rate, shift_hours, work_date, contract, about, responsibilities, requirements, benefits, qualifications, tags, quick_apply, contact_email, published_at, created_at, companies(name, segment)";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function relative(iso: string | null) {
  if (!iso) return "agora";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "há 1 dia";
  return `há ${days} dias`;
}

export function rowToJob(v: VacancyRow): Job {
  const salary =
    v.salary_text ||
    (v.salary_min && v.salary_max
      ? `${brl(v.salary_min)} – ${brl(v.salary_max)}`
      : v.salary_min
        ? `A partir de ${brl(v.salary_min)}`
        : "Salário a combinar");
  return {
    id: v.id,
    role: v.title,
    company: v.companies?.name ?? "Empresa",
    city: [v.city, v.work_model].filter(Boolean).join(" · "),
    salary,
    rating: 0,
    match: "—",
    tags: v.tags.length ? v.tags : [v.contract, v.work_model, v.seniority].filter(Boolean),
    posted: relative(v.published_at ?? v.created_at),
    quickApply: v.quick_apply,
    segment: v.segment || v.companies?.segment || "",
    about: v.about,
    responsibilities: v.responsibilities,
    requirements: v.requirements,
    benefits: v.benefits,
    qualifications: v.qualifications,
  };
}

function relativeFreela(iso: string): { quando: Freela["quando"]; data: string } {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return { quando: "hoje", data: "Hoje" };
  if (days === 1) return { quando: "anterior", data: "Ontem" };
  return { quando: "anterior", data: `Há ${days} dias` };
}

export function rowToFreela(v: VacancyRow): Freela {
  const at = v.published_at ?? v.created_at;
  const { quando, data } = relativeFreela(at);
  const carga = v.shift_hours ?? "8h";
  const freela: Freela = {
    id: v.id,
    cargo: v.title,
    empresa: v.companies?.name ?? "Empresa",
    local: [v.city, v.work_model].filter(Boolean).join(" · "),
    diariaValor: Number(v.daily_rate ?? v.salary_min ?? 0),
    carga,
    cargaHoras: Number(carga.replace(/\D/g, "")) || 8,
    periodo: v.contract || "Horário flexível",
    quando,
    data,
    publishedAt: at,
    descricao: v.about,
    tags: v.tags.slice(0, 4),
    aberto: v.status === "publicada",
  };
  return v.contact_email ? { ...freela, contato: v.contact_email } : freela;
}

/** Vagas publicadas por tipo (leitura pública). */
export async function fetchPublishedVacancies(type: "contratual" | "freelance") {
  const { data, error } = await supabase
    .from("vacancies")
    .select(SELECT)
    .eq("status", "publicada")
    .eq("type", type)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as VacancyRow[];
}

export async function fetchJobs() {
  return (await fetchPublishedVacancies("contratual")).map(rowToJob);
}

export async function fetchFreelas() {
  return (await fetchPublishedVacancies("freelance")).map(rowToFreela);
}

export async function fetchVacancyById(id: string) {
  const { data, error } = await supabase.from("vacancies").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as unknown as VacancyRow | null) ?? null;
}

/** Vagas de uma empresa (todas as situações, para o painel empresarial). */
export async function fetchCompanyVacancies(companyId: string) {
  const { data, error } = await supabase
    .from("vacancies")
    .select(SELECT)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as VacancyRow[];
}
