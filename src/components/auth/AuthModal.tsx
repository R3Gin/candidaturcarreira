import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  homeForAccount,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  useAuth,
  type AccountType,
} from "@/hooks/useAuth";

type AuthMode = "entrar" | "criar";

type OpenOptions = { mode?: AuthMode; accountType?: AccountType };

type AuthModalContextValue = {
  open: boolean;
  openAuthModal: (options?: OpenOptions) => void;
  closeAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal precisa estar dentro de <AuthModalProvider>");
  return ctx;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("entrar");
  const [accountType, setAccountType] = useState<AccountType>("candidato");

  const openAuthModal = useCallback((options?: OpenOptions) => {
    if (options?.mode) setMode(options.mode);
    if (options?.accountType) setAccountType(options.accountType);
    setOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openAuthModal, closeAuthModal }),
    [open, openAuthModal, closeAuthModal],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthDialog
        open={open}
        onOpenChange={setOpen}
        mode={mode}
        setMode={setMode}
        accountType={accountType}
        setAccountType={setAccountType}
      />
    </AuthModalContext.Provider>
  );
}

const accountOptions: { value: AccountType; label: string }[] = [
  { value: "candidato", label: "Candidato" },
  { value: "empresa", label: "Empresa" },
  { value: "freela", label: "Freela" },
];

const schema = z.object({
  name: z.string().trim().max(120, "Máximo de 120 caracteres").optional(),
  email: z.string().trim().email("Informe um e-mail válido").max(255, "E-mail muito longo"),
  password: z.string().min(6, "Mínimo de 6 caracteres").max(72, "Máximo de 72 caracteres"),
});

type FormValues = z.infer<typeof schema>;

function AuthDialog({
  open,
  onOpenChange,
  mode,
  setMode,
  accountType,
  setAccountType,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  accountType: AccountType;
  setAccountType: (t: AccountType) => void;
}) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [busy, setBusy] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  // Ao autenticar, fecha o modal e leva para a área da conta.
  useEffect(() => {
    if (!open || !user || !profile) return;
    onOpenChange(false);
    navigate({ to: homeForAccount(profile.account_type) });
  }, [open, user, profile, navigate, onOpenChange]);

  useEffect(() => {
    if (!open) {
      form.reset();
      setBusy(false);
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setBusy(true);
    try {
      if (mode === "entrar") {
        await signInWithEmail(values.email, values.password);
        toast.success("Bem-vindo de volta!");
      } else {
        if (!values.name) {
          form.setError("name", { message: "Informe seu nome" });
          return;
        }
        await signUpWithEmail({
          email: values.email,
          password: values.password,
          name: values.name,
          accountType,
        });
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
  });

  const google = async () => {
    try {
      await signInWithGoogle(accountType);
    } catch (err) {
      toast.error("Login com Google indisponível", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    }
  };

  const forgotPassword = async () => {
    const email = form.getValues("email").trim();
    if (!z.string().email().safeParse(email).success) {
      form.setError("email", { message: "Informe seu e-mail para recuperar a senha" });
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Link enviado", { description: "Confira sua caixa de entrada." });
    } catch (err) {
      toast.error("Não foi possível enviar o link", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-border bg-background/80 px-3 py-2 text-sm font-normal text-ink outline-none transition focus:border-primary/60";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 rounded-2xl border-white/40 bg-background/90 p-6 shadow-2xl backdrop-blur-lg">
        <div className="text-center">
          <span className="font-display text-2xl font-bold tracking-tight text-primary">
            Candidatu
          </span>
          <DialogTitle className="mt-3 font-display text-xl font-bold text-ink">
            {mode === "entrar" ? "Entrar na sua conta" : "Criar sua conta"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-ink-soft">
            {mode === "entrar"
              ? "Use seu e-mail e senha ou continue com o Google."
              : "Escolha o tipo de conta e comece em menos de um minuto."}
          </DialogDescription>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-1 rounded-full bg-secondary p-1">
          {accountOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setAccountType(o.value)}
              aria-pressed={accountType === o.value}
              className={`rounded-full px-2 py-1.5 text-xs font-bold transition ${
                accountType === o.value
                  ? "bg-background text-primary shadow-sm"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          {mode === "criar" && (
            <label className="block text-sm font-semibold text-ink">
              Nome completo
              <input {...form.register("name")} className={inputClass} autoComplete="name" />
              {form.formState.errors.name && (
                <span className="mt-1 block text-xs font-normal text-destructive">
                  {form.formState.errors.name.message}
                </span>
              )}
            </label>
          )}

          <label className="block text-sm font-semibold text-ink">
            E-mail
            <input
              type="email"
              autoComplete="email"
              {...form.register("email")}
              className={inputClass}
            />
            {form.formState.errors.email && (
              <span className="mt-1 block text-xs font-normal text-destructive">
                {form.formState.errors.email.message}
              </span>
            )}
          </label>

          <label className="block text-sm font-semibold text-ink">
            Senha
            <input
              type="password"
              autoComplete={mode === "entrar" ? "current-password" : "new-password"}
              {...form.register("password")}
              className={inputClass}
            />
            {form.formState.errors.password && (
              <span className="mt-1 block text-xs font-normal text-destructive">
                {form.formState.errors.password.message}
              </span>
            )}
          </label>

          {mode === "entrar" && (
            <button
              type="button"
              onClick={forgotPassword}
              className="text-xs font-semibold text-primary underline"
            >
              Esqueci minha senha
            </button>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-card transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "entrar" ? "Entrar" : "Criar conta"}
          </button>

          <button
            type="button"
            onClick={google}
            className="w-full rounded-xl border border-border bg-background/70 px-4 py-2 text-sm font-bold text-ink transition hover:border-primary/40"
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
      </DialogContent>
    </Dialog>
  );
}
