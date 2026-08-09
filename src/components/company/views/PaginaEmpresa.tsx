import { useRef, useState } from "react";
import {
  BookOpen,
  Building2,
  Check,
  Download,
  FileText,
  Gift,
  HeartHandshake,
  Sparkles,
  Trash2,
  Upload,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useCompanyStore, type CompanyDoc, type CompanyProfile } from "../store";

type Tab = "perfil" | "historia" | "cultura" | "beneficios" | "rh" | "documentos";

const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: "perfil", label: "Perfil e dados", icon: User },
  { id: "historia", label: "História", icon: BookOpen },
  { id: "cultura", label: "Cultura", icon: Sparkles },
  { id: "beneficios", label: "Benefícios", icon: Gift },
  { id: "rh", label: "Informações de RH", icon: HeartHandshake },
  { id: "documentos", label: "Documentos e políticas", icon: FileText },
];

const docCategories: CompanyDoc["category"][] = [
  "Política de RH",
  "Código de conduta",
  "Benefícios",
  "Processo seletivo",
  "Outros",
];

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}


function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-brand-cyan";

function List({ items, icon }: { items: string[]; icon?: boolean }) {
  return (
    <ul className="mt-2 space-y-1.5 text-sm text-ink">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          {icon ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" strokeWidth={2.2} />
          ) : (
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-cyan" />
          )}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PaginaEmpresa() {
  const { profile, updateProfile, addDocument, removeDocument, can } = useCompanyStore();
  const canEdit = can("editar_marca");
  const [tab, setTab] = useState<Tab>("perfil");
  const [form, setForm] = useState<CompanyProfile>(profile);
  const [docDraft, setDocDraft] = useState<{
    name: string;
    category: CompanyDoc["category"];
    description: string;
  }>({ name: "", category: "Política de RH", description: "" });
  const docInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const lines = (v: string) =>
    v
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

  const uploadImage = async (file: File, key: "logoUrl" | "hrPhotoUrl") => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande", { description: "Envie um arquivo de até 2 MB." });
      return;
    }
    const url = await readAsDataUrl(file);
    set(key, url);
    updateProfile({ [key]: url } as Partial<CompanyProfile>);
    toast.success("Imagem atualizada");
  };

  const uploadDoc = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Arquivo muito grande", { description: "Envie um documento de até 4 MB." });
      return;
    }
    const url = await readAsDataUrl(file);
    addDocument({
      name: docDraft.name.trim() || file.name,
      category: docDraft.category,
      description: docDraft.description.trim(),
      fileName: file.name,
      size: file.size,
      url,
    });
    setDocDraft({ name: "", category: "Política de RH", description: "" });
    toast.success("Documento disponível para download");
  };

  const save = () => {
    updateProfile(form);
    toast.success("Página da empresa atualizada", {
      description: "As pessoas candidatas já veem essas informações na vaga.",
    });
  };


  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Página da empresa</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          História, cultura, benefícios e RH
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Tudo que você preencher aqui aparece junto da vaga para detalhar melhor a candidatura —
          quanto mais completo, maior a taxa de resposta.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "border-transparent bg-brand text-primary-foreground"
                : "border-border bg-card text-ink-soft hover:text-ink"
            }`}
          >
            <t.icon className="h-4 w-4" strokeWidth={1.9} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          {tab === "perfil" && (
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt={`Logo da ${form.name}`}
                      className="h-16 w-16 rounded-2xl border border-border object-cover"
                    />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                      <Building2 className="h-7 w-7 text-brand-cyan" strokeWidth={1.9} />
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-ink">Logo da empresa</p>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadImage(file, "logoUrl");
                        e.target.value = "";
                      }}
                    />
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink"
                      >
                        <Upload className="h-3.5 w-3.5" strokeWidth={2} /> Enviar logo
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {form.hrPhotoUrl ? (
                    <img
                      src={form.hrPhotoUrl}
                      alt={form.hrContact}
                      className="h-16 w-16 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                      <User className="h-7 w-7 text-brand-cyan" strokeWidth={1.9} />
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-ink">Foto do responsável</p>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadImage(file, "hrPhotoUrl");
                        e.target.value = "";
                      }}
                    />
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink"
                      >
                        <Upload className="h-3.5 w-3.5" strokeWidth={2} /> Enviar foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nome da empresa">
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Segmento">
                  <input
                    value={form.segment}
                    onChange={(e) => set("segment", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Tamanho do time">
                  <input
                    value={form.size}
                    onChange={(e) => set("size", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Cidade">
                  <input
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Site">
                  <input
                    value={form.site}
                    onChange={(e) => set("site", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="LinkedIn">
                  <input
                    value={form.hrLinkedin}
                    onChange={(e) => set("hrLinkedin", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Sobre a empresa">
                <textarea
                  rows={4}
                  value={form.about}
                  onChange={(e) => set("about", e.target.value)}
                  className={inputClass}
                />
              </Field>

              <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                Dados pessoais do responsável
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nome completo">
                  <input
                    value={form.hrContact}
                    onChange={(e) => set("hrContact", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Cargo">
                  <input
                    value={form.hrRole}
                    onChange={(e) => set("hrRole", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="E-mail">
                  <input
                    value={form.hrEmail}
                    onChange={(e) => set("hrEmail", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Telefone">
                  <input
                    value={form.hrPhone}
                    onChange={(e) => set("hrPhone", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          )}

          {tab === "historia" && (
            <div className="grid gap-3">
              <Field label="Ano de fundação">
                <input
                  value={form.founded}
                  onChange={(e) => set("founded", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Nossa história">
                <textarea
                  rows={6}
                  value={form.history}
                  onChange={(e) => set("history", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Marcos da empresa" hint="Um por linha.">
                <textarea
                  rows={5}
                  value={form.milestones.join("\n")}
                  onChange={(e) => set("milestones", lines(e.target.value))}
                  className={inputClass}
                />
              </Field>
            </div>
          )}

          {tab === "cultura" && (
            <div className="grid gap-3">
              <Field label="Como é trabalhar aqui">
                <textarea
                  rows={6}
                  value={form.cultureText}
                  onChange={(e) => set("cultureText", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Valores" hint="Um por linha.">
                <textarea
                  rows={5}
                  value={form.values.join("\n")}
                  onChange={(e) => set("values", lines(e.target.value))}
                  className={inputClass}
                />
              </Field>
              <Field label="Modelo de trabalho">
                <input
                  value={form.workModel}
                  onChange={(e) => set("workModel", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Diversidade e inclusão">
                <textarea
                  rows={4}
                  value={form.diversity}
                  onChange={(e) => set("diversity", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          )}

          {tab === "beneficios" && (
            <div className="grid gap-3">
              <Field label="Benefícios em destaque" hint="Separados por vírgula.">
                <input
                  value={form.benefits.join(", ")}
                  onChange={(e) =>
                    set(
                      "benefits",
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Detalhamento dos benefícios">
                <textarea
                  rows={7}
                  value={form.benefitsDetail}
                  onChange={(e) => set("benefitsDetail", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          )}

          {tab === "rh" && (
            <div className="grid gap-3">
              <Field label="Responsável de RH">
                <input
                  value={form.hrContact}
                  onChange={(e) => set("hrContact", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="E-mail de contato">
                <input
                  value={form.hrEmail}
                  onChange={(e) => set("hrEmail", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Prazo de resposta">
                <input
                  value={form.responseTime}
                  onChange={(e) => set("responseTime", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Etapas do processo seletivo" hint="Uma por linha, na ordem.">
                <textarea
                  rows={6}
                  value={form.processSteps.join("\n")}
                  onChange={(e) => set("processSteps", lines(e.target.value))}
                  className={inputClass}
                />
              </Field>
            </div>
          )}

          {tab === "documentos" && (
            <div className="grid gap-4">
              <div>
                <h2 className="font-display text-base font-semibold text-ink">
                  Documentos e políticas de RH
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Anexe PDFs e arquivos que as pessoas candidatas podem baixar direto na página da
                  empresa: políticas internas, código de conduta, guia de benefícios e detalhes do
                  processo seletivo.
                </p>
              </div>

              {canEdit && (
                <div className="grid gap-3 rounded-xl border border-dashed border-border p-4">
                  <Field label="Nome do documento">
                    <input
                      value={docDraft.name}
                      onChange={(e) => setDocDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder="Política de home office"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Categoria">
                    <select
                      value={docDraft.category}
                      onChange={(e) =>
                        setDocDraft((d) => ({
                          ...d,
                          category: e.target.value as CompanyDoc["category"],
                        }))
                      }
                      className={inputClass}
                    >
                      {docCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Descrição" hint="Explique o que a pessoa vai encontrar no arquivo.">
                    <textarea
                      rows={3}
                      value={docDraft.description}
                      onChange={(e) => setDocDraft((d) => ({ ...d, description: e.target.value }))}
                      className={inputClass}
                    />
                  </Field>
                  <input
                    ref={docInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadDoc(file);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    <Upload className="h-4 w-4" strokeWidth={2} /> Anexar arquivo
                  </button>
                </div>
              )}

              <ul className="grid gap-3">
                {profile.documents.length === 0 && (
                  <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-ink-soft">
                    Nenhum documento anexado ainda.
                  </li>
                )}
                {profile.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-start gap-3 rounded-xl border border-border p-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                      <FileText className="h-5 w-5 text-brand-cyan" strokeWidth={1.9} />
                    </span>
                    <div className="min-w-[12rem] flex-1">
                      <p className="text-sm font-semibold text-ink">{doc.name}</p>
                      <p className="text-xs text-ink-soft">
                        {doc.category} · {doc.fileName} · {formatSize(doc.size)} · atualizado em{" "}
                        {new Date(doc.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                      {doc.description && (
                        <p className="mt-1 text-sm text-ink-soft">{doc.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.url ? (
                        <a
                          href={doc.url}
                          download={doc.fileName}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink"
                        >
                          <Download className="h-3.5 w-3.5" strokeWidth={2} /> Baixar
                        </a>
                      ) : (
                        <span className="text-xs font-semibold text-ink-soft">Exemplo</span>
                      )}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => removeDocument(doc.id)}
                          aria-label={`Remover ${doc.name}`}
                          className="inline-flex items-center rounded-full border border-border p-1.5 text-ink-soft hover:text-coral"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {canEdit ? (
            <button
              type="button"
              onClick={save}
              className="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Salvar página
            </button>
          ) : (
            <p className="mt-4 text-xs font-semibold text-ink-soft">
              Somente administradores e RH podem editar a página da empresa.
            </p>
          )}
        </section>

        <aside className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="bg-brand px-5 py-4 text-primary-foreground">
              <p className="text-xs font-bold uppercase tracking-wide opacity-80">
                Prévia para candidatos
              </p>
              <div className="mt-1 flex items-center gap-3">
                {form.logoUrl && (
                  <img
                    src={form.logoUrl}
                    alt={`Logo da ${form.name}`}
                    className="h-10 w-10 rounded-xl border border-white/30 object-cover"
                  />
                )}
                <div>
                  <h2 className="font-display text-lg font-semibold">{form.name}</h2>
                  <p className="text-xs opacity-90">
                    {form.segment} · {form.size} · desde {form.founded}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
                  <BookOpen className="h-4 w-4 text-brand-cyan" strokeWidth={1.9} /> Nossa história
                </h3>
                <p className="mt-1 text-sm text-ink-soft">{form.history}</p>
                <List items={form.milestones} />
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
                  <Sparkles className="h-4 w-4 text-brand-cyan" strokeWidth={1.9} /> Cultura
                </h3>
                <p className="mt-1 text-sm text-ink-soft">{form.cultureText}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.values.map((v) => (
                    <span
                      key={v}
                      className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-ink-soft"
                    >
                      {v}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-ink-soft">
                  <Users className="mr-1 inline h-3.5 w-3.5" /> {form.workModel}
                </p>
                <p className="mt-1 text-xs text-ink-soft">{form.diversity}</p>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
                  <Gift className="h-4 w-4 text-brand-cyan" strokeWidth={1.9} /> Benefícios
                </h3>
                <List items={form.benefits} icon />
                <p className="mt-2 text-sm text-ink-soft">{form.benefitsDetail}</p>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
                  <HeartHandshake className="h-4 w-4 text-brand-cyan" strokeWidth={1.9} />{" "}
                  Informações de RH
                </h3>
                <div className="mt-1 flex items-center gap-3">
                  {form.hrPhotoUrl && (
                    <img
                      src={form.hrPhotoUrl}
                      alt={form.hrContact}
                      className="h-10 w-10 rounded-full border border-border object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm text-ink">{form.hrContact}</p>
                    <p className="text-xs text-ink-soft">{form.hrRole}</p>
                  </div>
                </div>
                <p className="mt-1 text-sm text-ink-soft">{form.hrEmail}</p>
                <p className="text-sm text-ink-soft">{form.hrPhone}</p>
                <p className="text-sm text-ink-soft">{form.responseTime}</p>
                <ol className="mt-2 space-y-1.5 text-sm text-ink">
                  {form.processSteps.map((step, i) => (
                    <li key={step} className="flex gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-ink-soft">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
                  <FileText className="h-4 w-4 text-brand-cyan" strokeWidth={1.9} /> Documentos para
                  download
                </h3>
                <ul className="mt-2 space-y-2">
                  {profile.documents.length === 0 && (
                    <li className="text-sm text-ink-soft">Nenhum documento publicado.</li>
                  )}
                  {profile.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {doc.name}
                        </span>
                        <span className="block text-xs text-ink-soft">
                          {doc.category} · {formatSize(doc.size)}
                        </span>
                      </span>
                      {doc.url ? (
                        <a
                          href={doc.url}
                          download={doc.fileName}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                        >
                          <Download className="h-3.5 w-3.5" strokeWidth={2} /> Baixar
                        </a>
                      ) : (
                        <span className="shrink-0 text-xs text-ink-soft">Exemplo</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
              <Building2 className="h-4 w-4 text-brand-cyan" strokeWidth={1.9} /> Completude da
              página
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {(
                [
                  ["História", form.history.length > 80],
                  ["Marcos", form.milestones.length >= 3],
                  ["Cultura e valores", form.values.length >= 3],
                  ["Benefícios detalhados", form.benefitsDetail.length > 60],
                  ["Etapas do processo", form.processSteps.length >= 3],
                  ["Contato de RH", form.hrEmail.includes("@")],
                ] as const
              ).map(([label, ok]) => (
                <li key={label} className="flex items-center gap-2 text-ink-soft">
                  <Check
                    className={`h-4 w-4 ${ok ? "text-brand-cyan" : "text-border"}`}
                    strokeWidth={2.2}
                  />
                  {label}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
