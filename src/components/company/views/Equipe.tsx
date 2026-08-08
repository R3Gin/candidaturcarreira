import { useState } from "react";
import { Check, Lock, Mail, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import {
  initials,
  permissions,
  roleDescription,
  rolePermissions,
  roles,
  useCompanyStore,
  type Role,
} from "../store";

const permissionLabels: Record<(typeof permissions)[number], string> = {
  ver_visao: "Ver visão geral",
  ver_pipeline: "Ver pipeline",
  ver_vagas: "Ver vagas",
  ver_banco: "Ver banco de talentos",
  ver_entrevistas: "Ver agenda",
  ver_marca: "Ver marca empregadora",
  ver_equipe: "Ver equipe",
  mover_candidato: "Mover candidatos de etapa",
  reprovar_candidato: "Reprovar com feedback",
  gerenciar_vagas: "Publicar e editar vagas",
  agendar_entrevista: "Agendar entrevistas",
  editar_marca: "Editar marca empregadora",
  gerenciar_equipe: "Gerenciar equipe e permissões",
};

export function Equipe() {
  const {
    members,
    currentMember,
    can,
    addMember,
    updateMemberRole,
    activateMember,
    removeMember,
    setCurrentMember,
  } = useCompanyStore();
  const manage = can("gerenciar_equipe");
  const [form, setForm] = useState({ name: "", email: "", role: "Recrutador" as Role });
  const [error, setError] = useState("");

  const invite = () => {
    if (form.name.trim().length < 3) return setError("Informe o nome completo da pessoa.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) return setError("E-mail inválido.");
    if (members.some((m) => m.email.toLowerCase() === form.email.toLowerCase()))
      return setError("Esse e-mail já faz parte da equipe.");
    setError("");
    addMember({ name: form.name.trim(), email: form.email.trim().toLowerCase(), role: form.role });
    setForm({ name: "", email: "", role: "Recrutador" });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Equipe e permissões</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          {members.length} pessoas com acesso ao painel
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Convide RH, recrutadores e gestores. Cada cargo libera apenas as áreas necessárias — quem
          não tem permissão nem vê o menu correspondente.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold text-ink">Acessando como</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Troque de pessoa para conferir como o painel fica para cada cargo.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setCurrentMember(m.id)}
              className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                m.id === currentMember.id
                  ? "border-brand bg-brand text-primary-foreground"
                  : "border-border bg-card text-ink-soft hover:bg-secondary"
              }`}
            >
              {m.name}
              <span className="block text-[11px] font-medium opacity-80">{m.role}</span>
            </button>
          ))}
        </div>
      </section>

      {manage ? (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-ink">Convidar membro</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1.2fr_1.4fr_1fr_auto]">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nome completo"
              className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-ink"
            />
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@empresa.com.br"
              className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-ink"
            />
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
              className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold text-ink"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={invite}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-primary-foreground"
            >
              <UserPlus className="h-4 w-4" /> Convidar
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-soft">{roleDescription[form.role]}</p>
          {error && <p className="mt-2 text-xs font-semibold text-destructive">{error}</p>}
        </section>
      ) : (
        <section className="flex items-start gap-3 rounded-2xl border border-dashed border-border p-5 text-sm text-ink-soft">
          <Lock className="mt-0.5 h-4 w-4 text-brand-cyan" />
          Seu cargo ({currentMember.role}) pode visualizar a equipe, mas apenas administradores
          convidam pessoas e alteram permissões.
        </section>
      )}

      <ul className="space-y-3">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
          >
            <span className="brand-gradient inline-flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold text-primary-foreground">
              {initials(m.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-semibold text-ink">
                {m.name}
                {m.id === currentMember.id && (
                  <span className="ml-2 rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-ink">
                    você
                  </span>
                )}
              </p>
              <p className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                <Mail className="h-3.5 w-3.5" /> {m.email} ·{" "}
                {m.status === "Ativo" ? "Acesso ativo" : "Convite pendente"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {manage ? (
                <select
                  value={m.role}
                  onChange={(e) => updateMemberRole(m.id, e.target.value as Role)}
                  className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-ink"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-ink">
                  <ShieldCheck className="h-3.5 w-3.5" /> {m.role}
                </span>
              )}
              {manage && m.status === "Convite pendente" && (
                <button
                  type="button"
                  onClick={() => activateMember(m.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-ink hover:bg-secondary"
                >
                  <Check className="h-3.5 w-3.5" /> Ativar acesso
                </button>
              )}
              {manage && members.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remover ${m.name}`}
                  onClick={() => removeMember(m.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-semibold text-ink">Matriz de permissões</h2>
        <div className="mt-4 -mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="pb-2 pr-4">Permissão</th>
                {roles.map((r) => (
                  <th key={r} className="pb-2 px-3 text-center">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p} className="border-t border-border">
                  <td className="py-2 pr-4 font-semibold text-ink">{permissionLabels[p]}</td>
                  {roles.map((r) => (
                    <td key={r} className="px-3 py-2 text-center">
                      {rolePermissions[r].includes(p) ? (
                        <Check className="mx-auto h-4 w-4 text-brand-cyan" />
                      ) : (
                        <span className="text-ink-soft">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
