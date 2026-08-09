import { useServerFn } from "@tanstack/react-start";
import {
  Copy,
  Download,
  EyeOff,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { generateResume } from "@/lib/curriculo.functions";
import { useAppStore, type Resume } from "../store";
import { PageHead, SectionCard } from "./ui";

const seniorities = ["Estágio", "Júnior", "Pleno", "Sênior", "Coordenação"];
const tones = ["Profissional e direto", "Comercial e persuasivo", "Técnico e detalhado"];

type Form = {
  targetRole: string;
  seniority: string;
  city: string;
  experience: string;
  education: string;
  skills: string;
  achievements: string;
  tone: string;
};

export function MeuCurriculo({ onGoToJobs }: { onGoToJobs: () => void }) {
  const { account, resume, saveResume, skills, setSkills, preferences } = useAppStore();
  const generate = useServerFn(generateResume);

  const [visible, setVisible] = useState(true);
  const [file, setFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Form>({
    targetRole: preferences?.role ?? "",
    seniority: preferences?.seniority ?? "Pleno",
    city: preferences?.city ?? "",
    experience: "",
    education: "",
    skills: skills.join(", "),
    achievements: "",
    tone: tones[0]!,
  });

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onGenerate = async () => {
    if (!form.targetRole.trim()) {
      toast.error("Informe o cargo que você busca para a IA montar o currículo.");
      return;
    }
    setLoading(true);
    try {
      const draft = await generate({
        data: {
          name: account.name,
          targetRole: form.targetRole,
          seniority: form.seniority,
          city: form.city,
          experience: form.experience,
          education: form.education,
          skills: form.skills,
          achievements: form.achievements,
          tone: form.tone,
        },
      });
      const built: Resume = { ...draft, createdAt: new Date().toISOString() };
      saveResume(built);
      toast.success("Currículo criado em segundos pela IA do Candidatu.");
    } catch (e) {
      console.error(e);
      toast.error("Não conseguimos gerar agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  const plainText = resume
    ? [
        account.name,
        resume.headline,
        "",
        "RESUMO",
        resume.summary,
        "",
        "EXPERIÊNCIA",
        ...resume.experiences.flatMap((e) => [
          `${e.role} — ${e.company} (${e.period})`,
          ...e.bullets.map((b) => `• ${b}`),
          "",
        ]),
        "HABILIDADES",
        resume.skills.join(" · "),
        "",
        "FORMAÇÃO",
        ...resume.education,
      ].join("\n")
    : "";

  const download = () => {
    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `curriculo-${account.name.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <PageHead
        eyebrow="Meu currículo"
        title="Currículo em segundos, com ajuda da IA"
        subtitle="Responda o formulário rápido e a IA do Candidatu escreve resumo, experiências e habilidades prontos para candidatura."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-accent/40 bg-card p-5 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint">
              <Wand2 className="h-4.5 w-4.5 text-accent" strokeWidth={2} />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Formulário rápido</h2>
              <p className="text-xs text-ink-soft">Leva menos de 2 minutos.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <Field label="Cargo que você busca">
              <input
                value={form.targetRole}
                onChange={(e) => set("targetRole", e.target.value)}
                placeholder="Ex.: Analista Administrativo"
                className={inputCls}
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Senioridade">
                <select
                  value={form.seniority}
                  onChange={(e) => set("seniority", e.target.value)}
                  className={inputCls}
                >
                  {seniorities.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Cidade">
                <input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Ex.: Joinville · SC"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Experiências (empresa, cargo, período)">
              <textarea
                value={form.experience}
                onChange={(e) => set("experience", e.target.value)}
                rows={3}
                placeholder="Ex.: Nuvem Log — Assistente administrativo — 2022 a 2025; rotinas de documentos e relatórios de frota"
                className={`${inputCls} h-auto py-2`}
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Formação">
                <input
                  value={form.education}
                  onChange={(e) => set("education", e.target.value)}
                  placeholder="Ex.: Administração — Univille"
                  className={inputCls}
                />
              </Field>
              <Field label="Tom do texto">
                <select
                  value={form.tone}
                  onChange={(e) => set("tone", e.target.value)}
                  className={inputCls}
                >
                  {tones.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Habilidades e idiomas">
              <input
                value={form.skills}
                onChange={(e) => set("skills", e.target.value)}
                placeholder="Excel avançado, inglês intermediário, SAP"
                className={inputCls}
              />
            </Field>

            <Field label="Conquistas e resultados (opcional)">
              <textarea
                value={form.achievements}
                onChange={(e) => set("achievements", e.target.value)}
                rows={2}
                placeholder="Ex.: reduzi 18% do custo de frete renegociando transportadoras"
                className={`${inputCls} h-auto py-2`}
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : (
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            )}
            {loading ? "A IA está escrevendo…" : "Criar currículo com IA"}
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-ink">Prévia do currículo</h2>
            {resume && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(plainText);
                    toast.success("Currículo copiado.");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-soft hover:text-accent"
                >
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.9} /> Copiar
                </button>
                <button
                  type="button"
                  onClick={download}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-soft hover:text-accent"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.9} /> Baixar
                </button>
              </div>
            )}
          </div>

          {loading && !resume && (
            <div className="mt-4 space-y-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-3 animate-pulse rounded-full bg-secondary" />
              ))}
            </div>
          )}

          {!resume && !loading && (
            <p className="mt-4 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-ink-soft">
              Preencha o formulário rápido e a IA monta seu currículo aqui, pronto para usar nas
              candidaturas rápidas.

            </p>
          )}

          {resume && (
            <div className="mt-4 space-y-4">
              <header className="border-b border-border pb-3">
                <p className="font-display text-lg font-bold text-ink">{account.name}</p>
                <p className="text-sm font-semibold text-accent">{resume.headline}</p>
                <p className="text-xs text-muted-foreground">
                  {account.email} · {account.phone}
                  {form.city ? ` · ${form.city}` : ""}
                </p>
              </header>

              <div>
                <p className="eyebrow">Resumo</p>
                <p className="mt-1 text-sm text-ink-soft">{resume.summary}</p>
              </div>

              <div>
                <p className="eyebrow">Experiência</p>
                <div className="mt-2 space-y-3">
                  {resume.experiences.map((e) => (
                    <div key={`${e.company}-${e.role}`}>
                      <p className="text-sm font-semibold text-ink">
                        {e.role} · {e.company}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{e.period}</p>
                      <ul className="mt-1 space-y-1">
                        {e.bullets.map((b) => (
                          <li key={b} className="flex gap-2 text-sm text-ink-soft">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow">Habilidades</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {resume.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-ink-soft"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow">Formação</p>
                <ul className="mt-1 space-y-1">
                  {resume.education.map((ed) => (
                    <li key={ed} className="text-sm text-ink-soft">
                      {ed}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={onGoToJobs}
                className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Usar este currículo em candidaturas
              </button>
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SectionCard title="Visibilidade">
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-semibold text-ink"
          >
            <EyeOff className="h-4 w-4" strokeWidth={1.75} />
            {visible
              ? "Empresas contratantes podem encontrar você"
              : "Empresas contratantes não podem encontrar você"}
          </button>
          <p className="mt-3 text-sm text-ink-soft">
            Com o currículo visível, empresas do Candidatu podem convidar você direto para processos
            seletivos.
          </p>
        </SectionCard>

        <SectionCard title="Currículo em arquivo">
          {file ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary p-4">
              <FileText className="h-5 w-5 text-accent" strokeWidth={1.75} />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{file}</span>
              <button
                type="button"
                aria-label="Remover currículo"
                onClick={() => setFile(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-background"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl border border-dashed border-border p-5 text-left transition-colors hover:border-accent"
            >
              <span className="inline-flex items-center gap-2 font-display text-base font-semibold text-ink">
                <Upload className="h-5 w-5 text-ink-soft" strokeWidth={1.75} />
                Carregar currículo
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                PDF, DOCX, DOC, RTF ou TXT.
              </span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.rtf,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setFile(f.name);
                toast.success("Currículo anexado ao seu perfil.");
              }
            }}
          />
        </SectionCard>
      </div>

      <SectionCard title="Habilidades e idiomas do perfil">
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-ink"
            >
              {s}
              <button
                type="button"
                aria-label={`Remover ${s}`}
                onClick={() => setSkills(skills.filter((x) => x !== s))}
                className="text-ink-soft hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </span>
          ))}
          {skills.length === 0 && (
            <p className="text-sm text-ink-soft">
              Gere seu currículo com IA para preencher as habilidades automaticamente.
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-ink outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink-soft">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
