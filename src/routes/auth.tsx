import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  homeForAccount,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  useAuth,
  type AccountType,
} from "@/hooks/useAuth";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const title = "Entrar ou criar conta | Candidatu";
const description =
  "Acesse sua conta Candidatu para acompanhar candidaturas, publicar vagas como empresa ou receber freelas do dia.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const accountOptions: { value: AccountType; label: string; hint: string }[] = [
  { value: "candidato", label: "Sou candidato", hint: "Quero me candidatar a vagas" },
  { value: "empresa", label: "Sou empresa", hint: "Quero publicar vagas e contratar" },
  { value: "freela", label: "Sou freela", hint: "Quero pegar freelas do dia" },
];

function AuthPage() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [accountType, setAccountType] = useState<AccountType>("candidato");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Perfis criados via Google não escolhem o tipo antes do redirecionamento.
  useEffect(() => {
    if (!user || !profile) return;
    const wanted = window.localStorage.getItem("candidatu-account-type") as AccountType | null;
    void (async () => {
      let type = profile.account_type;
      if (wanted && wanted !== profile.account_type && !profile.onboarded_at) {
        await supabase.from("profiles").update({ account_type: wanted }).eq("id", user.id);
        type = wanted;
      }
      window.localStorage.removeItem("candidatu-account-type");
      navigate({ to: homeForAccount(type) });
    })();
  }, [user, profile, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "entrar") {
        await signInWithEmail(email.trim(), password);
        toast.success("Bem-vindo de volta!");
      } else {
        await signUpWithEmail({ email: email.trim(), password, name: name.trim(), accountType });
        toast.success("Conta criada!", {
          description: "Se a confirmação de e-mail estiver ativa, confirme para entrar.",
        });
      }
    } catch (err) {
      toast.error("Não foi possível continuar", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    try {
      await signInWithGoogle(accountType);
    } catch (err) {
      toast.error("Login com Google indisponível", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-14">
        <p className="eyebrow">Acesso</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">
          {mode === "entrar" ? "Entrar no Candidatu" : "Criar sua conta"}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {mode === "entrar"
            ? "Use seu e-mail e senha ou entre com o Google."
            : "Escolha o tipo de conta e comece em menos de um minuto."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
          {mode === "criar" && (
            <>
              <div className="grid gap-2">
                {accountOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setAccountType(o.value)}
                    className={`rounded-xl border p-3 text-left transition ${
                      accountType === o.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className="block text-sm font-bold text-ink">{o.label}</span>
                    <span className="block text-xs text-ink-soft">{o.hint}</span>
                  </button>
                ))}
              </div>
              <label className="block text-sm font-semibold text-ink">
                Nome completo
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal text-ink"
                />
              </label>
            </>
          )}

          <label className="block text-sm font-semibold text-ink">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal text-ink"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal text-ink"
            />
          </label>

          <button
            type="submit"
            disabled={busy || loading}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "entrar" ? "Entrar" : "Criar conta"}
          </button>

          <button
            type="button"
            onClick={google}
            className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold text-ink transition hover:border-primary/40"
          >
            Continuar com Google
          </button>

          <p className="text-center text-xs text-ink-soft">
            {mode === "entrar" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}
              className="font-bold text-primary underline"
            >
              {mode === "entrar" ? "Criar agora" : "Entrar"}
            </button>
          </p>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
