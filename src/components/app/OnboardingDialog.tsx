import { useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, Minus } from "lucide-react";
import { useAppStore } from "@/components/app/store";

const KEY = "candidatu-onboarding";
const TOTAL = 6;

type Props = {
  onFinish: () => void;
  onGoToProfile: () => void;
  onExit: () => void;
};

export function OnboardingDialog({ onFinish, onGoToProfile, onExit }: Props) {
  const { account, setAccount, logActivity } = useAppStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(account.name ?? "");
  const [occupation, setOccupation] = useState("");
  const [photo, setPhoto] = useState<string | null>(account.photo ?? null);
  const [username, setUsername] = useState(
    (account.name || "candidato").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  );
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const persist = () => {
    setAccount({ ...account, name: name.trim() || account.name, photo });
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ done: true, occupation, username, at: new Date().toISOString() }),
      );
    } catch {
      /* ignore */
    }
  };

  const complete = () => {
    persist();
    logActivity("perfil", "Configuração inicial concluída", occupation || "Perfil configurado");
    onFinish();
  };

  const next = () => setStep((s) => Math.min(TOTAL, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const onPick = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
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
                <Field label="Seu nome" value={name} onChange={setName} autoFocus />
                <Field
                  label="Cargo ou ocupação"
                  value={occupation}
                  onChange={setOccupation}
                  placeholder="Ex.: Analista de marketing"
                />
              </div>
              <Nav onPrev={prev} onNext={next} disabled={!name.trim()} />
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
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPick(e.target.files?.[0])}
                />
                <p className="mt-3 text-sm text-ink-soft">Clique para enviar uma imagem</p>
              </div>
              <Nav onPrev={prev} onNext={next} />
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
                  onChange={(v) => setUsername(v.toLowerCase().replace(/\s+/g, "-"))}
                />
                <p className="mt-2 break-all text-xs text-ink-soft">
                  Seu endereço de perfil: https://candidatu.com.br/perfil/{username || "seu-usuario"}
                </p>
              </div>
              <Nav onPrev={prev} onNext={next} />
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
              <Nav onPrev={prev} onNext={next} nextLabel="Concordo" />
            </>
          )}

          {step === 6 && (
            <>
              <h3 className="font-display text-xl font-bold text-ink">Prontinho!</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                Você pode terminar de configurar o seu <strong>Perfil</strong> agora. É{" "}
                <strong>altamente recomendado</strong> que você o faça, pois é através dele que
                recrutadores terão acesso ao seu histórico profissional em uma eventual candidatura.
              </p>
              <button
                type="button"
                onClick={() => {
                  persist();
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
  disabled?: boolean;
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
  disabled,
}: {
  onPrev: () => void;
  onNext: () => void;
  nextLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-center gap-6">
      <button type="button" onClick={onPrev} className="text-sm font-semibold text-brand">
        Anterior
      </button>
      <PrimaryButton onClick={onNext} disabled={disabled}>
        {nextLabel}
      </PrimaryButton>
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
  placeholder?: string;
  autoFocus?: boolean;
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
