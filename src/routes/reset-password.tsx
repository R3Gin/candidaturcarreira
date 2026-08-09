import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const title = "Redefinir senha | Candidatu";
const description = "Defina uma nova senha para acessar sua conta Candidatu com segurança.";

export const Route = createFileRoute("/reset-password")({
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
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha precisa ter ao menos 6 caracteres");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha atualizada!");
      navigate({ to: "/" });
    } catch (err) {
      toast.error("Não foi possível atualizar", {
        description: err instanceof Error ? err.message : "Abra o link do e-mail novamente.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-14">
        <p className="eyebrow">Segurança</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">Definir nova senha</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Escolha uma senha nova para sua conta Candidatu.
        </p>
        <form
          onSubmit={submit}
          className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card"
        >
          <label className="block text-sm font-semibold text-ink">
            Nova senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal text-ink"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar nova senha
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
