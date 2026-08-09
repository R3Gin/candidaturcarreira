import type { Job } from "@/components/app/store";

/** Contato exibido no botão "Contato" da vaga. */
export function jobContact(job: Pick<Job, "company">) {
  const slug = job.company
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return `mailto:vagas@${slug}.com.br`;
}
