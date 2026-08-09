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

// Schema no formato aceito pela API oficial do Google (subset OpenAPI)
const responseSchema = {
  type: "OBJECT",
  required: ["headline", "summary", "experiences", "skills", "education"],
  properties: {
    headline: { type: "STRING" },
    summary: { type: "STRING" },
    experiences: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["role", "company", "period", "bullets"],
        properties: {
          role: { type: "STRING" },
          company: { type: "STRING" },
          period: { type: "STRING" },
          bullets: { type: "ARRAY", items: { type: "STRING" } },
        },
      },
    },
    skills: { type: "ARRAY", items: { type: "STRING" } },
    education: { type: "ARRAY", items: { type: "STRING" } },
  },
} as const;

export const generateResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<ResumeDraft> => {
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) throw new Error("GEMINI_API_KEY ausente");

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

    const model = "gemini-2.5-flash";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  "Você é um especialista em carreira e escreve currículos claros, objetivos e em português do Brasil. Responda sempre em json.",
              },
            ],
          },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema,
          },
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Falha ao gerar currículo (${res.status}): ${body.slice(0, 300)}`);
    }

    const payload = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const raw =
      payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    if (!cleaned) throw new Error("Resposta vazia do modelo");
    const parsed = JSON.parse(cleaned) as ResumeDraft;
    return parsed;
  });

