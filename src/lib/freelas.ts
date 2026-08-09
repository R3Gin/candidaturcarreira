export type Freela = {
  id: string;
  cargo: string;
  empresa: string;
  local: string;
  diariaValor: number;
  carga: string;
  cargaHoras: number;
  periodo: string;
  quando: "hoje" | "anterior";
  data: string;
  publishedAt: string;
  descricao: string;
  tags: string[];
  contato?: string;
  aberto: boolean;
};

export const brlDiaria = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function contactHref(contato: string) {
  return contato.includes("@")
    ? `mailto:${contato}`
    : `https://wa.me/55${contato.replace(/\D/g, "")}`;
}

/** Feed de freelas publicados (leitura pública no banco). */
export async function allFreelas(): Promise<Freela[]> {
  const { fetchFreelas } = await import("@/lib/db/vacancies");
  return fetchFreelas();
}
