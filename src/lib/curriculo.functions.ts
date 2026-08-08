import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  name: z.string().min(1),
  targetRole: z.string().min(1),
  seniority: z.string().default("Pleno"),
  city: z.string().default(""),
  experience: z.string().default(""),
  education: z.string().default(""),
  skills: z.string().default(""),
  achievements: z.string().default(""),
  tone: z.string().default("Profissional e direto"),
});

export type ResumeDraft = {
  headline: string;
  summary: string;
  experiences: { role: string; company: string; period: string; bullets: string[] }[];
  skills: string[];
  education: string[];
};

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "summary", "experiences", "skills", "education"],
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    experiences: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["role", "company", "period", "bullets"],
        properties: {
          role: { type: "string" },
          company: { type: "string" },
          period: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
        },
      },
    },
    skills: { type: "array", items: { type: "string" } },
    education: { type: "array", items: { type: "string" } },
  },
} as const;

export const generateResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<ResumeDraft> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");

    const prompt = `Monte um currículo profissional em português do Brasil com base nas informações abaixo.
Nome: ${data.name}
Cargo alvo: ${data.targetRole}
Senioridade: ${data.seniority}
Cidade: ${data.city}
Experiência informada: ${data.experience}
Formação: ${data.education}
Habilidades: ${data.skills}
Conquistas/resultados: ${data.achievements}
Tom desejado: ${data.tone}

Regras:
- Resumo profissional de 3 a 4 linhas, sem clichês.
- Para cada experiência, 3 bullets com verbo de ação e resultado mensurável quando possível (estime com bom senso se não houver número).
- Se a experiência informada estiver vaga, crie no máximo 2 experiências plausíveis e coerentes com o cargo alvo.
- 8 a 12 habilidades objetivas.
- O campo headline é o título profissional (ex.: "Analista Administrativo Pleno · Joinville"); nunca repita o nome da pessoa nele.
- Responda apenas com json válido no schema pedido.`;


    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Você é um especialista em carreira e escreve currículos claros, objetivos e em português do Brasil. Responda sempre em json.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "curriculo", strict: true, schema: jsonSchema },
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Falha ao gerar currículo (${res.status}): ${body.slice(0, 300)}`);
    }

    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned) as ResumeDraft;
    return parsed;
  });
