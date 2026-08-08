import { useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, Minus } from "lucide-react";
import { z } from "zod";
import { useAppStore, type Account } from "@/components/app/store";

const KEY = "candidatu-onboarding";
const TOTAL = 6;

const nameSchema = z
  .string()
  .trim()
  .min(3, { message: "Informe seu nome completo (mínimo 3 caracteres)." })
  .max(80, { message: "O nome deve ter no máximo 80 caracteres." })
  .regex(/^[\p{L}][\p{L}\s'.-]*$/u, { message: "Use apenas letras, espaços, hífen ou apóstrofo." });

const occupationSchema = z
  .string()
  .trim()
  .min(2, { message: "Informe um cargo ou ocupação válido." })
  .max(60, { message: "A ocupação deve ter no máximo 60 caracteres." });

const usernameSchema = z
  .string()
  .trim()
  .min(3, { message: "O nome de usuário precisa de ao menos 3 caracteres." })
  .max(40, { message: "O nome de usuário deve ter no máximo 40 caracteres." })
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Use apenas letras minúsculas, números e hífen (sem espaços).",
  });

const photoSchema = z
  .string()
  .regex(/^data:image\/(png|jpe?g|webp|gif);base64,/, {
    message: "Envie uma imagem PNG, JPG, WEBP ou GIF.",
  })
  .max(2_500_000, { message: "A imagem deve ter menos de 2 MB." });

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Props = {
  onFinish: () => void;
  onGoToProfile: () => void;
  onExit: () => void;
};

export function OnboardingDialog({ onFinish, onGoToProfile, onExit }: Props) {
  const { account, setAccount, logActivity } = useAppStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(account.name ?? "");
  const [occupation, setOccupation] = useState(account.occupation ?? "");
  const [photo, setPhoto] = useState<string | null>(account.photo ?? null);
  const [username, setUsername] = useState(account.username || slugify(account.name || ""));
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const persist = (patch: Partial<Account>) => {
    setAccount({
      ...account,
      name: name.trim(),
      occupation: occupation.trim(),
      username: username.trim(),
      photo,
      ...patch,
    });
  };

  const validateStep = () => {
    if (step === 2) {
      const n = nameSchema.safeParse(name);
      if (!n.success) return n.error.issues[0]?.message ?? "Nome inválido.";
      const o = occupationSchema.safeParse(occupation);
      if (!o.success) return o.error.issues[0]?.message ?? "Ocupação inválida.";
      setName(n.data);
      setOccupation(o.data);
      if (!username.trim()) setUsername(slugify(n.data));
    }
    if (step === 3 && photo) {
      const img = photoSchema.safeParse(photo);
      if (!img.success) return img.error.issues[0]?.message ?? "Imagem inválida.";
    }
    if (step === 4) {
      const u = usernameSchema.safeParse(username);
      if (!u.success) return u.error.issues[0]?.message ?? "Nome de usuário inválido.";
      setUsername(u.data);
    }
    return null;
  };

  const next = () => {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    if (step === 5) {
      persist({ termsAcceptedAt: new Date().toISOString() });
    } else if (step >= 2) {
      persist({});
    }
    setStep((s) => Math.min(TOTAL, s + 1));
  };

  const prev = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const complete = () => {
    const at = new Date().toISOString();
    persist({ onboardedAt: at, termsAcceptedAt: account.termsAcceptedAt ?? at });
    try {
      localStorage.setItem(KEY, JSON.stringify({ done: true, at }));
    } catch {
      /* ignore */
    }
    logActivity(
      "perfil",
      "Registro inicial concluído",
      `${name.trim()} · ${occupation.trim()} · @${username.trim()}`,
    );
    onFinish();
  };

  const onPick = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 2_000_000) {
      setError("A imagem deve ter menos de 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result);
      const parsed = photoSchema.safeParse(data);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Imagem inválida.");
        return;
      }
      setError(null);
      setPhoto(data);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Configuração inicial"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-card animate-in"
      >
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-display text-xl font-bold text-brand">Configuração inicial</h2>
        </div>

        <div className="min-h-[280px] px-6 py-8 text-center">
          {step === 1 && (
            <>
              <h3 className="font-display text-xl font-bold text-ink">Olá!</h3>
              <p className="mx-auto mt-3 max-w-sm text-sm text-ink-soft">
                Para ter uma experiência completa na Candidatu, precisamos que você faça algumas
                configurações iniciais. É rapidinho, prometemos ;)
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <PrimaryButton onClick={next}>Ok, vamos lá!</PrimaryButton>
                <button
                  type="button"
                  onClick={onExit}
                  className="text-sm font-semibold text-brand-cyan underline"
                >
                  Sair
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="font-display text-xl font-bold text-ink">Nome e ocupação</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Por favor, digite seu nome e sua ocupação
              </p>
              <div className="mt-6 space-y-4 text-left">
                <Field
                  label="Seu nome"
                  value={name}
                  onChange={(v) => {
                    setError(null);
                    setName(v.slice(0, 80));
                  }}
                  autoFocus
                />
                <Field
                  label="Cargo ou ocupação"
                  value={occupation}
                  onChange={(v) => {
                    setError(null);
                    setOccupation(v.slice(0, 60));
                  }}
                  placeholder="Ex.: Analista de marketing"
                />
              </div>
              <Nav onPrev={prev} onNext={next} error={error} />
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="font-display text-xl font-bold text-ink">Seu Avatar</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Você pode avançar e deixar para fazer isso depois, se preferir.
              </p>
              <div className="mt-6 flex flex-col items-center">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="grid size-28 place-items-center overflow-hidden rounded-full border border-border bg-sidebar-accent text-brand"
                  >
                    {photo ? (
                      <img src={photo} alt="Avatar do candidato" className="size-full object-cover" />
                    ) : (
                      <Camera className="size-8" />
                    )}
                  </button>
                  {photo && (
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      aria-label="Remover imagem"
                      className="absolute -right-1 -top-1 grid size-8 place-items-center rounded-full bg-accent text-accent-foreground shadow-card"
                    >
                      <Minus className="size-4" />
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => onPick(e.target.files?.[0])}
                />
                <p className="mt-3 text-sm text-ink-soft">Clique para enviar uma imagem</p>
              </div>
              <Nav onPrev={prev} onNext={next} error={error} />
            </>
          )}

          {step === 4 && (
            <>
              <h3 className="font-display text-xl font-bold text-ink">Nome de usuário</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                Agora você pode escolher um username para você, ou apenas avançar e deixar para
                fazer isso depois, se preferir.
              </p>
              <div className="mt-6 text-left">
                <Field
                  label="Nome de usuário"
                  value={username}
                  onChange={(v) => {
                    setError(null);
                    setUsername(slugify(v).slice(0, 40));
                  }}
                />
                <p className="mt-2 break-all text-xs text-ink-soft">
                  Seu endereço de perfil: https://candidatu.com.br/perfil/{username || "seu-usuario"}
                </p>
              </div>
              <Nav onPrev={prev} onNext={next} error={error} />
            </>
          )}

          {step === 5 && (
            <>
              <h3 className="font-display text-xl font-bold text-ink">Política de Uso</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                Ao continuar e utilizar essa plataforma você estará de acordo com os{" "}
                <a href="#" className="font-semibold text-brand-cyan underline">
                  Termos de Uso
                </a>{" "}
                e com a{" "}
                <a href="#" className="font-semibold text-brand-cyan underline">
                  Política de privacidade
                </a>{" "}
                da Candidatu
              </p>
              <Nav onPrev={prev} onNext={next} nextLabel="Concordo" error={error} />
            </>
          )}

          {step === 6 && (
            <>
              <h3 className="font-display text-xl font-bold text-ink">Prontinho!</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                Cadastro validado e salvo na sua conta: <strong>{name.trim()}</strong>
                {occupation.trim() ? ` · ${occupation.trim()}` : ""} · @{username.trim()}. Você pode
                terminar de configurar o seu <strong>Perfil</strong> agora — é através dele que
                recrutadores acessam seu histórico profissional.
              </p>
              <button
                type="button"
                onClick={() => {
                  complete();
                  onGoToProfile();
                }}
                className="mx-auto mt-6 inline-flex items-center gap-2 font-semibold text-brand transition hover:gap-3"
              >
                Configurar meu Perfil <ArrowRight className="size-4" />
              </button>
              <div className="mt-6 border-t border-border pt-6">
                <Nav onPrev={prev} onNext={complete} nextLabel="Ir para o site" />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-border px-6 py-3 text-sm text-ink-soft">
          Passo {step} de {TOTAL}
        </div>
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full brand-gradient px-7 py-3 text-sm font-semibold text-brand-foreground shadow-card transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
    >
      {children}
    </button>
  );
}

function Nav({
  onPrev,
  onNext,
  nextLabel = "Próximo",
  error,
}: {
  onPrev: () => void;
  onNext: () => void;
  nextLabel?: string;
  error?: string | null;
}) {
  return (
    <div className="mt-6">
      {error && (
        <p role="alert" className="mb-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
      <div className="flex items-center justify-center gap-6">
        <button type="button" onClick={onPrev} className="text-sm font-semibold text-brand">
          Anterior
        </button>
        <PrimaryButton onClick={onNext}>{nextLabel}</PrimaryButton>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string | undefined;
  autoFocus?: boolean | undefined;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      <input
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30"
      />
    </label>
  );
}

export function shouldShowOnboarding() {
  try {
    return !localStorage.getItem(KEY);
  } catch {
    return false;
  }
}
