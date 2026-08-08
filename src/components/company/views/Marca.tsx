import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useCompanyStore } from "../store";

export function Marca() {
  const { profile, updateProfile, logs } = useCompanyStore();
  const [form, setForm] = useState(profile);

  const reviews = [
    {
      id: "r1",
      title: "Processo transparente do início ao fim",
      role: "Pessoa Desenvolvedora Front-end",
      rating: 5,
      text: "Recebi feedback em 4 dias e o salário estava na vaga. Etapas exatamente como descrito.",
    },
    {
      id: "r2",
      title: "Time de People muito acessível",
      role: "Analista de People & Cultura",
      rating: 4,
      text: "Boa comunicação, só senti falta de mais detalhes sobre o teste técnico.",
    },
  ];

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Marca empregadora</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          Perfil da empresa no Candidatu
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          É esse perfil que as pessoas candidatas veem — nota, avaliações e benefícios influenciam
          diretamente sua taxa de resposta.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-ink">Dados da empresa</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["name", "Nome da empresa"],
                ["segment", "Segmento"],
                ["size", "Tamanho do time"],
                ["city", "Sede"],
                ["site", "Site"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-soft">
                  {label}
                </span>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-brand-cyan"
                />
              </label>
            ))}
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-soft">
                Sobre a empresa
              </span>
              <textarea
                rows={4}
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-brand-cyan"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-soft">
                Benefícios (separados por vírgula)
              </span>
              <input
                value={form.benefits.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    benefits: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-brand-cyan"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => {
              updateProfile(form);
              toast.success("Perfil da empresa atualizado");
            }}
            className="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Salvar alterações
          </button>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold text-ink">Termômetro Candidatu</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-display text-4xl font-bold text-ink">
                {profile.rating.toFixed(1)}
              </span>
              <div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i <= Math.round(profile.rating) ? "fill-accent text-accent" : "text-border"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-ink-soft">
                  {profile.recommend}% recomendariam trabalhar aqui
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.benefits.map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-ink-soft"
                >
                  {b}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold text-ink">
              Avaliações de candidatos
            </h2>
            <ul className="mt-3 space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-xl bg-secondary p-3">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i <= r.rating ? "fill-accent text-accent" : "text-border"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-ink">{r.title}</p>
                  <p className="text-xs text-ink-soft">{r.role}</p>
                  <p className="mt-1 text-sm text-ink">{r.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold text-ink">Histórico de ações RH</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {logs.slice(0, 8).map((l) => (
                <li key={l.id} className="text-ink">
                  <strong className="font-semibold">{l.title}</strong> — {l.detail}
                  <span className="ml-1 text-[11px] text-ink-soft">
                    {new Date(l.at).toLocaleString("pt-BR")}
                  </span>
                </li>
              ))}
              {logs.length === 0 && <li className="text-ink-soft">Sem registros ainda.</li>}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
