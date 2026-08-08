import { useRef, useState } from "react";
import { ArrowRight, EyeOff, FileText, Plus, Trash2, Upload, X } from "lucide-react";
import { PageHead, SectionCard } from "./ui";

export function MeuCurriculo({ onGoToJobs }: { onGoToJobs: () => void }) {
  const [visible, setVisible] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>(["Excel avançado", "Inglês intermediário"]);
  const [certs, setCerts] = useState<string[]>(["Green Belt · 2024"]);
  const [adding, setAdding] = useState<"skill" | "cert" | null>(null);
  const [draft, setDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const value = draft.trim();
    if (!value) return setAdding(null);
    if (adding === "skill") setSkills((p) => [...p, value]);
    if (adding === "cert") setCerts((p) => [...p, value]);
    setDraft("");
    setAdding(null);
  };

  return (
    <div className="space-y-5">
      <PageHead
        eyebrow="Meu currículo"
        title="Currículo e experiência"
        subtitle="Um currículo completo preenche candidaturas automaticamente e melhora suas recomendações."
      />

      <SectionCard title="Visibilidade">
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-semibold text-ink"
        >
          <EyeOff className="h-4 w-4" strokeWidth={1.75} />
          {visible
            ? "Empresas contratantes podem encontrar você"
            : "Empresas contratantes não podem encontrar você"}
        </button>
        <p className="mt-3 max-w-2xl text-sm text-ink-soft">
          Você pode deixar seu currículo visível para empresas que estão contratando no Candidatu ou
          ocultá-lo. Para mais informações, consulte nosso Aviso de privacidade.
        </p>
      </SectionCard>

      <SectionCard title="Currículo">
        <p className="max-w-2xl text-sm text-ink-soft">
          Adicione um currículo para economizar tempo e preencher candidaturas automaticamente.
          Você também pode compartilhá-lo para ficar sabendo de vagas abertas diretamente de
          empresas.
        </p>
        {file ? (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-secondary p-4">
            <FileText className="h-5 w-5 text-accent" strokeWidth={1.75} />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{file}</span>
            <button
              type="button"
              aria-label="Remover currículo"
              onClick={() => setFile(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-background"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-4 w-full rounded-2xl border border-dashed border-border p-5 text-left transition-colors hover:border-accent"
          >
            <span className="inline-flex items-center gap-2 font-display text-base font-semibold text-ink">
              <Upload className="h-5 w-5 text-ink-soft" strokeWidth={1.75} />
              Carregar currículo
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Use um arquivo PDF, DOCX, DOC, RTF ou TXT.
            </span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.rtf,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f.name);
          }}
        />
      </SectionCard>

      <SectionCard title="Experiência">
        <p className="max-w-2xl text-sm text-ink-soft">
          Adicione sua experiência para receber recomendações de vagas e insights personalizados. Se
          quiser, permita que empresas contratantes tenham acesso a essas informações habilitando a
          visibilidade acima.
        </p>

        <div className="mt-5">
          <p className="text-sm font-semibold text-ink">Habilidades e idiomas</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.map((s) => (
              <Tag key={s} label={s} onRemove={() => setSkills((p) => p.filter((x) => x !== s))} />
            ))}
            <AddButton
              label="Adicionar habilidade ou idioma"
              onClick={() => {
                setAdding("skill");
                setDraft("");
              }}
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-ink">Certificações e licenças</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {certs.map((c) => (
              <Tag key={c} label={c} onRemove={() => setCerts((p) => p.filter((x) => x !== c))} />
            ))}
            <AddButton
              label="Adicionar certificado ou licença"
              onClick={() => {
                setAdding("cert");
                setDraft("");
              }}
            />
          </div>
        </div>

        {adding && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              placeholder={adding === "skill" ? "Ex.: Power BI" : "Ex.: NR-35 · 2025"}
              className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-ink outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={commit}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              Adicionar
            </button>
          </div>
        )}
      </SectionCard>

      <div className="rounded-2xl border border-border bg-secondary p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Fique sempre por dentro da sua busca de vagas
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Confira suas vagas salvas, buscas recentes e vagas recomendadas.
        </p>
        <button
          type="button"
          onClick={onGoToJobs}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
        >
          Ver sua atividade recente de vagas
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-ink">
      {label}
      <button type="button" aria-label={`Remover ${label}`} onClick={onRemove}>
        <X className="h-3.5 w-3.5 text-ink-soft" strokeWidth={2} />
      </button>
    </span>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2} />
      {label}
    </button>
  );
}
