import { useState } from "react";
import { Mail, PauseCircle, PlayCircle, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { brl, useCompanyStore, type Vacancy, type VacancyType } from "../store";

const empty = {
  type: "Contratual" as VacancyType,
  role: "",
  area: "Tecnologia",
  city: "",
  model: "Remoto" as Vacancy["model"],
  contract: "CLT" as Vacancy["contract"],
  seniority: "Pleno" as Vacancy["seniority"],
  salaryMin: 5000,
  salaryMax: 8000,
  dailyRate: 250,
  hours: "8h",
  period: "09h às 18h",
  contact: "",
  openings: 1,
  skills: "",
  description: "",
};

export function Vagas({ onOpenPipeline }: { onOpenPipeline: () => void }) {
  const { vacancies, candidates, addVacancy, setVacancyStatus, removeVacancy, can } =
    useCompanyStore();
  const manage = can("gerenciar_vagas");
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const isFreela = form.type === "Freelance";

  const submit = () => {
    if (form.role.trim().length < 3 || !form.city.trim()) {
      toast.error("Informe o título da vaga e a localidade");
      return;
    }
    if (!isFreela && form.salaryMax < form.salaryMin) {
      toast.error("A faixa salarial máxima deve ser maior que a mínima");
      return;
    }
    if (isFreela && Number(form.dailyRate) <= 0) {
      toast.error("Informe o valor da diária do freela");
      return;
    }
    addVacancy({
      type: form.type,
      role: form.role.trim(),
      area: form.area,
      city: form.city.trim(),
      model: form.model,
      contract: form.contract,
      seniority: form.seniority,
      salaryMin: isFreela ? Number(form.dailyRate) : Number(form.salaryMin),
      salaryMax: isFreela ? Number(form.dailyRate) : Number(form.salaryMax),
      ...(isFreela
        ? {
            dailyRate: Number(form.dailyRate),
            hours: form.hours.trim(),
            period: form.period.trim(),
          }
        : {}),
      ...(form.contact.trim() ? { contact: form.contact.trim() } : {}),
      openings: Number(form.openings),
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      description: form.description.trim(),
    });
    setForm(empty);
    setOpen(false);
    toast.success(
      isFreela
        ? "Freela publicado — já aparece na página de Freelas"
        : "Vaga contratual publicada — já aparece no painel dos candidatos",
    );
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Vagas publicadas</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            {vacancies.length} vagas no seu perfil
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Toda vaga publicada no Candidatu exige faixa salarial e etapas visíveis.
          </p>
        </div>
        {manage ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            <Plus className="h-4 w-4" /> {open ? "Fechar formulário" : "Publicar nova vaga"}
          </button>
        ) : (
          <span className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-ink-soft">
            Somente leitura no seu cargo
          </span>
        )}
      </header>

      {open && manage && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-ink">Nova vaga</h2>
          <div className="mt-4 rounded-xl border border-border bg-secondary/50 p-3">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-soft">
              Tipo de vaga
            </span>
            <div className="flex flex-wrap gap-2">
              {(["Contratual", "Freelance"] as VacancyType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={form.type === t}
                  onClick={() => setForm({ ...form, type: t })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    form.type === t
                      ? "bg-brand text-primary-foreground"
                      : "border border-border bg-card text-ink-soft"
                  }`}
                >
                  {t === "Contratual" ? "Vaga contratual" : "Freela (diária)"}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              {isFreela
                ? "Freelas aparecem na página pública de Freelas, com diária e carga horária."
                : "Vagas contratuais aparecem no painel dos candidatos."}
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Título da vaga">
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Ex.: Pessoa Desenvolvedora Back-end"
                className={input}
              />
            </Field>
            <Field label="Localidade">
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Ex.: São Paulo, SP"
                className={input}
              />
            </Field>
            <Field label="Área">
              <select
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className={input}
              >
                {["Tecnologia", "Design", "Dados", "Recursos Humanos", "Marketing", "Vendas"].map(
                  (a) => (
                    <option key={a}>{a}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Modelo de trabalho">
              <select
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value as Vacancy["model"] })}
                className={input}
              >
                {["Remoto", "Híbrido", "Presencial"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Contrato">
              <select
                value={form.contract}
                onChange={(e) =>
                  setForm({ ...form, contract: e.target.value as Vacancy["contract"] })
                }
                className={input}
              >
                {["CLT", "PJ", "Estágio"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Senioridade">
              <select
                value={form.seniority}
                onChange={(e) =>
                  setForm({ ...form, seniority: e.target.value as Vacancy["seniority"] })
                }
                className={input}
              >
                {["Júnior", "Pleno", "Sênior"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            {isFreela ? (
              <>
                <Field label="Valor da diária (R$)">
                  <input
                    type="number"
                    min={0}
                    value={form.dailyRate}
                    onChange={(e) => setForm({ ...form, dailyRate: Number(e.target.value) })}
                    className={input}
                  />
                </Field>
                <Field label="Carga horária">
                  <input
                    value={form.hours}
                    onChange={(e) => setForm({ ...form, hours: e.target.value })}
                    placeholder="Ex.: 8h"
                    className={input}
                  />
                </Field>
                <Field label="Período">
                  <input
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    placeholder="Ex.: 18h às 02h"
                    className={input}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Salário mínimo (R$)">
                  <input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => setForm({ ...form, salaryMin: Number(e.target.value) })}
                    className={input}
                  />
                </Field>
                <Field label="Salário máximo (R$)">
                  <input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => setForm({ ...form, salaryMax: Number(e.target.value) })}
                    className={input}
                  />
                </Field>
              </>
            )}
            <Field label="Contato (e-mail ou WhatsApp)">
              <input
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="vagas@empresa.com.br"
                className={input}
              />
            </Field>
            <Field label="Nº de posições">
              <input
                type="number"
                min={1}
                value={form.openings}
                onChange={(e) => setForm({ ...form, openings: Number(e.target.value) })}
                className={input}
              />
            </Field>
            <Field label="Competências (separadas por vírgula)">
              <input
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="Node, SQL, AWS"
                className={input}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Descrição e etapas do processo">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={input}
                />
              </Field>
            </div>
          </div>
          <button
            type="button"
            onClick={submit}
            className="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Publicar vaga
          </button>
        </section>
      )}

      <ul className="space-y-3">
        {vacancies.map((v) => {
          const applicants = candidates.filter((c) => c.vacancyId === v.id);
          return (
            <li key={v.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-ink">{v.role}</h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        v.status === "Publicada"
                          ? "bg-mint text-ink"
                          : v.status === "Pausada"
                            ? "bg-secondary text-ink-soft"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {v.status}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        v.type === "Freelance"
                          ? "bg-accent text-accent-foreground"
                          : "bg-brand/10 text-brand"
                      }`}
                    >
                      {v.type === "Freelance" ? "Freela · página de Freelas" : "Contratual · painel"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {v.area} · {v.city} · {v.model} · {v.contract} · {v.seniority}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {v.type === "Freelance"
                      ? `${brl(v.dailyRate ?? v.salaryMin)} / diária · ${v.hours ?? "8h"}${v.period ? ` · ${v.period}` : ""}`
                      : `${brl(v.salaryMin)} – ${brl(v.salaryMax)}`}{" "}
                    · {v.openings} {v.openings === 1 ? "posição" : "posições"} · publicada{" "}
                    {v.published}
                  </p>
                  {v.description && (
                    <p className="mt-2 max-w-2xl text-sm text-ink-soft">{v.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {v.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-ink-soft"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={onOpenPipeline}
                    className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-ink"
                  >
                    <Users className="h-4 w-4" /> {applicants.length} candidaturas
                  </button>
                  {v.contact && (
                    <a
                      href={
                        v.contact.includes("@")
                          ? `mailto:${v.contact}`
                          : `https://wa.me/${v.contact.replace(/\D/g, "")}`
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink"
                    >
                      <Mail className="h-4 w-4" /> Contato
                    </a>
                  )}
                  <div className={`flex gap-2 ${manage ? "" : "hidden"}`}>
                    {v.status === "Publicada" ? (
                      <button
                        type="button"
                        onClick={() => setVacancyStatus(v.id, "Pausada")}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-soft"
                      >
                        <PauseCircle className="h-3.5 w-3.5" /> Pausar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setVacancyStatus(v.id, "Publicada")}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-soft"
                      >
                        <PlayCircle className="h-3.5 w-3.5" /> Reabrir
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setVacancyStatus(v.id, "Encerrada")}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-soft"
                    >
                      Encerrar
                    </button>
                    <button
                      type="button"
                      aria-label={`Excluir vaga ${v.role}`}
                      onClick={() => {
                        removeVacancy(v.id);
                        toast("Vaga excluída");
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const input =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-brand-cyan";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      {children}
    </label>
  );
}
