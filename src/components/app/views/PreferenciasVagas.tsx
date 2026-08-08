import { useMemo, useState } from "react";
import { Bell, Check } from "lucide-react";
import { jobPool, useAppStore, type Preferences } from "../store";
import { Chip, PageHead, SectionCard } from "./ui";

const models = ["Remoto", "Híbrido", "Presencial"];
const contracts = ["CLT", "PJ", "Estágio", "Temporário"];
const seniorities = ["Estágio", "Júnior", "Pleno", "Sênior", "Coordenação"];
const availabilities = ["Imediata", "Em 15 dias", "Em 30 dias"];

function parseSalary(text: string) {
  const nums = text.replace(/\./g, "").match(/\d+/g);
  return nums ? Math.max(...nums.map(Number)) : 0;
}

export function PreferenciasVagas({ onGoToJobs }: { onGoToJobs: () => void }) {
  const { preferences, savePreferences, defaultPreferences } = useAppStore();
  const [form, setForm] = useState<Preferences>(preferences ?? defaultPreferences);
  const [saved, setSaved] = useState(false);

  const matches = useMemo(() => {
    if (!preferences) return [];
    const min = parseSalary(preferences.minSalary);
    return jobPool.filter((j) => {
      const roleOk =
        !preferences.role.trim() ||
        j.role.toLowerCase().includes(preferences.role.trim().toLowerCase());
      const modelOk =
        preferences.models.length === 0 ||
        preferences.models.some((m) => j.city.toLowerCase().includes(m.toLowerCase()));
      const cityOk =
        !preferences.city.trim() ||
        j.city.toLowerCase().includes(preferences.city.trim().toLowerCase());
      const salaryOk = min === 0 || parseSalary(j.salary) >= min;
      return roleOk && modelOk && cityOk && salaryOk;
    });
  }, [preferences]);

  const toggle = (key: "models" | "contracts", value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));

  return (
    <div className="space-y-5">
      <PageHead
        eyebrow="Preferências de vagas"
        title="Diga o que você procura e nós avisamos"
        subtitle="Salvamos este formulário no seu perfil. Sempre que uma empresa publicar algo parecido, você recebe um alerta e a vaga aparece abaixo."
      />

      <SectionCard title="Formulário de interesse">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="eyebrow">Cargo desejado</span>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Ex.: Analista Administrativo"
              className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="eyebrow">Cidade ou região</span>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Ex.: Joinville"
              className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="eyebrow">Pretensão salarial mínima</span>
            <input
              value={form.minSalary}
              onChange={(e) => setForm({ ...form, minSalary: e.target.value })}
              placeholder="Ex.: 3500"
              className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="eyebrow">Nível</span>
            <select
              value={form.seniority}
              onChange={(e) => setForm({ ...form, seniority: e.target.value })}
              className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-ink outline-none focus:border-accent"
            >
              {seniorities.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow">Disponibilidade</span>
            <select
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value })}
              className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-ink outline-none focus:border-accent"
            >
              {availabilities.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5">
          <p className="eyebrow">Modelo de trabalho</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {models.map((m) => (
              <Chip key={m} label={m} active={form.models.includes(m)} onClick={() => toggle("models", m)} />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="eyebrow">Tipo de contrato</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {contracts.map((c) => (
              <Chip
                key={c}
                label={c}
                active={form.contracts.includes(c)}
                onClick={() => toggle("contracts", c)}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <Toggle
            label="Quero receber alertas por e-mail"
            checked={form.notifyEmail}
            onChange={(v) => setForm({ ...form, notifyEmail: v })}
          />
          <Toggle
            label="Quero receber alertas por WhatsApp"
            checked={form.notifyWhats}
            onChange={(v) => setForm({ ...form, notifyWhats: v })}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              savePreferences(form);
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2500);
            }}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform active:scale-[0.96]"
          >
            Salvar preferências
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
              <Check className="h-4 w-4" strokeWidth={2} /> Preferências salvas no sistema
            </span>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Alertas para você"
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-ink">
            <Bell className="h-3.5 w-3.5" strokeWidth={2} />
            {matches.length} {matches.length === 1 ? "vaga compatível" : "vagas compatíveis"}
          </span>
        }
      >
        {!preferences ? (
          <p className="text-sm text-ink-soft">
            Salve suas preferências para começarmos a monitorar novas vagas compatíveis.
          </p>
        ) : matches.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Nenhuma vaga compatível hoje. Continuamos monitorando e avisamos assim que aparecer.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {matches.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{j.role}</p>
                  <p className="text-xs text-ink-soft">
                    {j.company} · {j.city} · {j.salary}
                  </p>
                </div>
                <span className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-bold text-ink">
                  {j.match}
                </span>
                <button type="button" onClick={onGoToJobs} className="text-xs font-semibold text-accent">
                  Ver vaga
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 text-left text-sm font-medium text-ink"
    >
      <span
        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
          checked ? "bg-accent" : "bg-secondary"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-card transition-transform ${checked ? "translate-x-4" : ""}`}
        />
      </span>
      {label}
    </button>
  );
}
