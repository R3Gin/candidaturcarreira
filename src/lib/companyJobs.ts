import type { Job } from "@/components/app/store";
import type { Vacancy } from "@/components/company/store";
import { companyVacancies } from "./freelas";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Converte uma vaga contratual publicada pela empresa em uma vaga do painel do candidato. */
export function vacancyToJob(v: Vacancy, company = "Movva"): Job {
  return {
    id: `cv-${v.id}`,
    role: v.role,
    company,
    city: `${v.city} · ${v.model}`,
    salary: `${brl(v.salaryMin)} – ${brl(v.salaryMax)}`,
    rating: 4.5,
    match: "—",
    tags: [v.contract, v.model, v.seniority],
    posted: v.published,
    quickApply: true,
    segment: `${v.area} · vaga publicada pela empresa`,
    about: v.description || "Vaga publicada pela empresa no painel Candidatu.",
    responsibilities: [v.description || "Detalhes enviados no primeiro contato."],
    requirements: v.skills.length ? v.skills : ["Sem requisitos obrigatórios informados"],
    benefits: ["Processo com etapas visíveis", "Faixa salarial aberta"],
    qualifications: v.skills.slice(0, 4),
  };
}

/** Vagas contratuais publicadas no painel empresarial. */
export function companyJobs(): Job[] {
  return companyVacancies("Contratual").map((v) => vacancyToJob(v));
}

/** Contato exibido no botão "Contato" da vaga. */
export function jobContact(job: Pick<Job, "company">) {
  const slug = job.company
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return `mailto:vagas@${slug}.com.br`;
}
