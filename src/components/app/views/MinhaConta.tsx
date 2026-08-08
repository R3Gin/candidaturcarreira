import { useRef, useState } from "react";
import { Camera, Check, ShieldAlert, Trash2 } from "lucide-react";
import { useAppStore } from "../store";
import { PageHead, SectionCard } from "./ui";

export function MinhaConta({ onSignOut }: { onSignOut: () => void }) {
  const { account, setAccount, deleteAccount } = useAppStore();
  const [form, setForm] = useState(account);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = form.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-5">
      <PageHead
        eyebrow="Minha conta"
        title="Dados de acesso e identidade"
        subtitle="Atualize seus contatos, sua senha e sua foto. Você também pode excluir a conta a qualquer momento."
      />

      <SectionCard title="Foto do perfil">
        <div className="flex flex-wrap items-center gap-4">
          {form.photo ? (
            <img
              src={form.photo}
              alt="Foto do perfil"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-mint font-display text-xl font-bold text-ink">
              {initials || "EM"}
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Camera className="h-4 w-4" strokeWidth={1.75} />
              Enviar nova foto
            </button>
            {form.photo && (
              <button
                type="button"
                onClick={() => setForm({ ...form, photo: null })}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-soft"
              >
                Remover
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setForm({ ...form, photo: String(reader.result) });
              reader.readAsDataURL(file);
            }}
          />
        </div>
      </SectionCard>

      <SectionCard title="Contatos">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nome completo"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
          />
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Input
            label="Telefone"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <Input
            label="Cargo ou ocupação"
            value={form.occupation ?? ""}
            onChange={(v) => setForm({ ...form, occupation: v.slice(0, 60) })}
          />
          <Input
            label="Nome de usuário"
            value={form.username ?? ""}
            onChange={(v) =>
              setForm({
                ...form,
                username: v
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+/, "")
                  .slice(0, 40),
              })
            }
          />
        </div>
        {form.username && (
          <p className="mt-3 break-all text-xs text-ink-soft">
            Perfil público: https://candidatu.com.br/perfil/{form.username}
          </p>
        )}
        {account.onboardedAt && (
          <p className="mt-1 text-xs text-ink-soft">
            Registro inicial validado em{" "}
            {new Date(account.onboardedAt).toLocaleDateString("pt-BR")} · termos aceitos
          </p>
        )}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setAccount(form);
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2500);
            }}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform active:scale-[0.96]"
          >
            Salvar alterações
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
              <Check className="h-4 w-4" strokeWidth={2} /> Dados atualizados
            </span>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Senha">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Senha atual"
            type="password"
            value={pw.current}
            onChange={(v) => setPw({ ...pw, current: v })}
          />
          <Input
            label="Nova senha"
            type="password"
            value={pw.next}
            onChange={(v) => setPw({ ...pw, next: v })}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            value={pw.confirm}
            onChange={(v) => setPw({ ...pw, confirm: v })}
          />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (!pw.current || !pw.next) return setPwMsg("Preencha a senha atual e a nova.");
              if (pw.next.length < 8) return setPwMsg("A nova senha precisa ter 8+ caracteres.");
              if (pw.next !== pw.confirm) return setPwMsg("As senhas não conferem.");
              setPw({ current: "", next: "", confirm: "" });
              setPwMsg("Senha alterada com sucesso.");
            }}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Alterar senha
          </button>
          {pwMsg && <span className="text-xs font-semibold text-ink-soft">{pwMsg}</span>}
        </div>
      </SectionCard>

      <div className="rounded-2xl border border-destructive/30 bg-card p-5 shadow-card">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <ShieldAlert className="h-5 w-5 text-destructive" strokeWidth={1.75} />
          Excluir minha conta
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          A autoexclusão apaga seu currículo, candidaturas, vagas salvas e preferências. Empresas
          deixam de ver seu perfil imediatamente. Esta ação não pode ser desfeita.
        </p>
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-destructive px-4 py-2 text-sm font-semibold text-destructive"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            Quero excluir minha conta
          </button>
        ) : (
          <div className="mt-4 max-w-sm">
            <Input
              label='Digite "EXCLUIR" para confirmar'
              value={deleteText}
              onChange={setDeleteText}
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={deleteText.trim().toUpperCase() !== "EXCLUIR"}
                onClick={() => {
                  deleteAccount();
                  onSignOut();
                }}
                className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-40"
              >
                Excluir definitivamente
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(false);
                  setDeleteText("");
                }}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-soft"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
  );
}
