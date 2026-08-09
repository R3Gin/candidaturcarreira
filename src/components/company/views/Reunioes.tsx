import { useState } from "react";
import {
  CalendarClock,
  CalendarX,
  CheckCircle2,
  Clock,
  Copy,
  Plus,
  Trash2,
  Users,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useMeetingInvites, useMeetingReminders } from "@/lib/useMeetings";
import { formatWhen, type MeetingInvite } from "@/lib/meetings";
import {
  REUNIAO_STATUS,
  REUNIAO_TIPOS,
  labelOf,
  useCompanyStore,
  type Meeting,
} from "../store";

type Form = {
  titulo: string;
  pauta: string;
  tipo: string;
  inicio: string;
  duracaoMin: string;
  participantes: string;
  candidatos: string[];
  link: string;
  status: string;
};

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const vazio = (): Form => ({
  titulo: "",
  pauta: "",
  tipo: "video",
  inicio: toLocalInput(new Date().toISOString()),
  duracaoMin: "30",
  participantes: "",
  candidatos: [],
  link: "",
  status: "agendada",
});

const statusTone: Record<string, string> = {
  agendada: "bg-mint text-ink",
  realizada: "bg-secondary text-ink-soft",
  cancelada: "bg-destructive/10 text-destructive",
};

const fieldClass =
  "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-brand";

export function Reunioes() {
  const {
    meetings,
    members,
    candidates,
    addMeeting,
    updateMeeting,
    setMeetingStatus,
    rescheduleMeeting,
    cancelMeeting,
    removeMeeting,
    profile,
    can,
  } = useCompanyStore();
  const invites = useMeetingInvites();
  const [remarcar, setRemarcar] = useState<Meeting | null>(null);
  const [remarcarForm, setRemarcarForm] = useState({ inicio: "", motivo: "" });
  const [cancelar, setCancelar] = useState<Meeting | null>(null);
  const [motivoCancel, setMotivoCancel] = useState("");

  useMeetingReminders(
    "empresa",
    meetings.map((m) => ({
      id: m.id,
      titulo: m.titulo,
      inicio: m.inicio,
      status: m.status,
      detail: `${labelOf(REUNIAO_TIPOS, m.tipo)} · ${m.duracaoMin} min${m.link ? ` · ${m.link}` : ""}`,
    })),
    { fallbackEmail: profile.contactEmail ?? "" },
  );
  const canManage = can("gerenciar_reunioes");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [form, setForm] = useState<Form>(vazio);

  const sorted = [...meetings].sort((a, b) => b.inicio.localeCompare(a.inicio));
  const agendadas = meetings.filter((m) => m.status === "agendada").length;
  const candidatosAtivos = candidates.filter((c) => !c.rejected);
  const nomeCandidato = (id: string) => candidates.find((c) => c.id === id)?.name ?? id;
  const toggleCandidato = (id: string) =>
    setForm((f) => ({
      ...f,
      candidatos: f.candidatos.includes(id)
        ? f.candidatos.filter((c) => c !== id)
        : [...f.candidatos, id],
    }));

  const submit = () => {
    if (!form.titulo.trim()) {
      toast.error("Informe o título da reunião.");
      return;
    }
    const payload = {
      titulo: form.titulo.trim(),
      pauta: form.pauta.trim(),
      tipo: form.tipo,
      inicio: new Date(form.inicio).toISOString(),
      duracaoMin: Number(form.duracaoMin) || 30,
      participantes: form.participantes
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      candidatos: form.candidatos,
      link: form.link.trim(),
      status: form.status,
    };
    if (editing) {
      updateMeeting(editing.id, payload);
      toast.success("Reunião atualizada!");
    } else {
      addMeeting(payload);
      toast.success("Reunião agendada!");
    }
    setOpen(false);
    setEditing(null);
    setForm(vazio());
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Reuniões</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            {agendadas} reunião(ões) agendada(s)
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Organize comitês de contratação, alinhamentos de RH e retrospectivas com pauta,
            participantes, duração e link de acesso.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm(vazio());
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Nova reunião
          </button>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((r) => (
          <article
            key={r.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-display text-base font-bold text-ink">{r.titulo}</h2>
                <p className="mt-1 inline-flex items-center gap-2 text-xs text-ink-soft">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {new Date(r.inicio).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}{" "}
                  · {r.duracaoMin} min
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone[r.status] ?? "bg-secondary text-ink-soft"}`}
              >
                {labelOf(REUNIAO_STATUS, r.status)}
              </span>
            </div>

            {r.pauta && <p className="text-sm text-ink-soft">{r.pauta}</p>}

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-ink">
                <Video className="h-3.5 w-3.5" /> {labelOf(REUNIAO_TIPOS, r.tipo)}
              </span>
              {r.participantes.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-soft">
                  <Users className="h-3.5 w-3.5" /> {r.participantes.length} participantes
                </span>
              )}
              {r.link && (
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(r.link);
                    toast.success("Link copiado!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-brand hover:bg-secondary"
                >
                  <Copy className="h-3.5 w-3.5" /> Copiar link
                </button>
              )}
            </div>

            {r.participantes.length > 0 && (
              <p className="text-xs text-ink-soft">{r.participantes.join(", ")}</p>
            )}

            {(r.candidatos?.length ?? 0) > 0 && (
              <ConfirmacoesPresenca
                invites={invites.filter((i) => i.meetingId === r.id)}
                nomes={(r.candidatos ?? []).map(nomeCandidato)}
              />
            )}

            <HistoricoAlteracoes invites={invites.filter((i) => i.meetingId === r.id)} />

            {canManage && (
              <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <select
                  aria-label="Status da reunião"
                  value={r.status}
                  onChange={(e) => setMeetingStatus(r.id, e.target.value)}
                  className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  {REUNIAO_STATUS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(r);
                    setForm({
                      titulo: r.titulo,
                      pauta: r.pauta,
                      tipo: r.tipo,
                      inicio: toLocalInput(r.inicio),
                      duracaoMin: String(r.duracaoMin),
                      participantes: r.participantes.join(", "),
                      candidatos: r.candidatos ?? [],
                      link: r.link,
                      status: r.status,
                    });
                    setOpen(true);
                  }}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-secondary hover:text-ink"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRemarcar(r);
                    setRemarcarForm({ inicio: toLocalInput(r.inicio), motivo: "" });
                  }}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-brand hover:bg-secondary"
                >
                  Reagendar
                </button>
                {r.status !== "cancelada" && (
                  <button
                    type="button"
                    onClick={() => {
                      setCancelar(r);
                      setMotivoCancel("");
                    }}
                    className="rounded-xl px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    Cancelar reunião
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Remover reunião"
                  onClick={() => {
                    removeMeeting(r.id);
                    toast.success("Reunião removida.");
                  }}
                  className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </article>
        ))}
        {sorted.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-ink-soft md:col-span-2">
            <Video className="mx-auto mb-2 h-6 w-6 text-brand-cyan" />
            Nenhuma reunião cadastrada.
          </p>
        )}
      </div>

      {open && canManage && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-5 shadow-lift sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">
                {editing ? "Editar reunião" : "Nova reunião"}
              </h2>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              className="mt-4 grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <label className="grid gap-1.5 text-xs font-semibold text-ink-soft">
                Título *
                <input
                  className={fieldClass}
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Comitê de contratação · Front-end"
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-ink-soft">
                Pauta
                <textarea
                  rows={3}
                  className={fieldClass}
                  value={form.pauta}
                  onChange={(e) => setForm({ ...form, pauta: e.target.value })}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-semibold text-ink-soft">
                  Início
                  <input
                    type="datetime-local"
                    className={fieldClass}
                    value={form.inicio}
                    onChange={(e) => setForm({ ...form, inicio: e.target.value })}
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-ink-soft">
                  Duração (min)
                  <input
                    type="number"
                    min={5}
                    className={fieldClass}
                    value={form.duracaoMin}
                    onChange={(e) => setForm({ ...form, duracaoMin: e.target.value })}
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-ink-soft">
                  Tipo
                  <select
                    className={fieldClass}
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  >
                    {REUNIAO_TIPOS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-ink-soft">
                  Status
                  <select
                    className={fieldClass}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {REUNIAO_STATUS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="grid gap-1.5 text-xs font-semibold text-ink-soft">
                Participantes (separados por vírgula)
                <input
                  className={fieldClass}
                  value={form.participantes}
                  onChange={(e) => setForm({ ...form, participantes: e.target.value })}
                  placeholder={members
                    .slice(0, 3)
                    .map((m) => m.name)
                    .join(", ")}
                />
              </label>
              <div className="grid gap-1.5 text-xs font-semibold text-ink-soft">
                Convidar candidatos (recebem notificação e mensagem no chat)
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-border bg-card p-2">
                  {candidatosAtivos.map((c) => (
                    <label
                      key={c.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-ink hover:bg-secondary"
                    >
                      <input
                        type="checkbox"
                        checked={form.candidatos.includes(c.id)}
                        onChange={() => toggleCandidato(c.id)}
                      />
                      {c.name}
                      <span className="ml-auto text-[11px] font-normal text-ink-soft">
                        {c.headline}
                      </span>
                    </label>
                  ))}
                  {candidatosAtivos.length === 0 && (
                    <p className="px-2 py-1.5 text-xs font-normal text-ink-soft">
                      Nenhum candidato ativo.
                    </p>
                  )}
                </div>
              </div>
              <label className="grid gap-1.5 text-xs font-semibold text-ink-soft">
                Link da chamada
                <input
                  className={fieldClass}
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="meet.candidatu.com/..."
                />
              </label>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {remarcar && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-5">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-lift">
            <h2 className="font-display text-lg font-bold text-ink">Reagendar reunião</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {remarcar.titulo} · atualmente {formatWhen(remarcar.inicio)}
            </p>
            <label className="mt-4 grid gap-1.5 text-xs font-semibold text-ink-soft">
              Nova data e hora
              <input
                type="datetime-local"
                className={fieldClass}
                value={remarcarForm.inicio}
                onChange={(e) => setRemarcarForm({ ...remarcarForm, inicio: e.target.value })}
              />
            </label>
            <label className="mt-3 grid gap-1.5 text-xs font-semibold text-ink-soft">
              Motivo (enviado aos convidados)
              <textarea
                rows={2}
                className={fieldClass}
                value={remarcarForm.motivo}
                onChange={(e) => setRemarcarForm({ ...remarcarForm, motivo: e.target.value })}
                placeholder="Conflito de agenda do gestor"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemarcar(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-secondary"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!remarcarForm.inicio) {
                    toast.error("Escolha a nova data.");
                    return;
                  }
                  rescheduleMeeting(
                    remarcar.id,
                    new Date(remarcarForm.inicio).toISOString(),
                    remarcarForm.motivo.trim(),
                  );
                  toast.success("Reunião reagendada e convidados avisados.");
                  setRemarcar(null);
                }}
                className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Reagendar e avisar
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelar && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-5">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-lift">
            <h2 className="font-display text-lg font-bold text-ink">Cancelar reunião</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {cancelar.titulo} · {formatWhen(cancelar.inicio)}
            </p>
            <label className="mt-4 grid gap-1.5 text-xs font-semibold text-ink-soft">
              Motivo do cancelamento
              <textarea
                rows={3}
                className={fieldClass}
                value={motivoCancel}
                onChange={(e) => setMotivoCancel(e.target.value)}
                placeholder="Vaga em revisão de escopo"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelar(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-secondary"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelMeeting(cancelar.id, motivoCancel.trim());
                  toast.success("Reunião cancelada e convidados avisados.");
                  setCancelar(null);
                }}
                className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90"
              >
                Cancelar e avisar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const rsvpTone: Record<string, string> = {
  confirmado: "bg-mint text-ink",
  recusado: "bg-destructive/10 text-destructive",
  pendente: "bg-secondary text-ink-soft",
};

const rsvpLabel: Record<string, string> = {
  confirmado: "Presença confirmada",
  recusado: "Não poderá participar",
  pendente: "Aguardando confirmação",
};

function ConfirmacoesPresenca({
  invites,
  nomes,
}: {
  invites: MeetingInvite[];
  nomes: string[];
}) {
  if (invites.length === 0) {
    return (
      <p className="text-xs font-semibold text-brand">Candidatos avisados: {nomes.join(", ")}</p>
    );
  }
  return (
    <div className="rounded-2xl bg-secondary/60 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
        Confirmação de presença
      </p>
      <ul className="mt-2 space-y-1.5">
        {invites.map((i) => {
          const Icon =
            i.rsvp === "confirmado" ? CheckCircle2 : i.rsvp === "recusado" ? XCircle : Clock;
          return (
            <li key={i.id} className="flex items-center gap-2 text-xs">
              <Icon className="h-3.5 w-3.5 shrink-0 text-ink-soft" strokeWidth={2} />
              <span className="min-w-0 flex-1 truncate font-semibold text-ink">
                {i.candidateName}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${rsvpTone[i.rsvp]}`}
              >
                {rsvpLabel[i.rsvp]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HistoricoAlteracoes({ invites }: { invites: MeetingInvite[] }) {
  const [open, setOpen] = useState(false);
  const changes = invites
    .flatMap((i) => i.changes.map((c) => ({ ...c, who: i.candidateName })))
    .sort((a, b) => b.at.localeCompare(a.at));
  if (changes.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
          <CalendarX className="h-3.5 w-3.5" /> Alterações · {changes.length}
        </span>
        <span className="text-[11px] font-semibold text-brand">{open ? "Ocultar" : "Ver"}</span>
      </button>
      {open && (
        <ol className="space-y-2 border-t border-border px-3 py-2">
          {changes.map((c) => (
            <li key={`${c.id}-${c.who}`} className="text-xs text-ink-soft">
              <span className="font-semibold text-ink">{c.detail}</span>
              <br />
              {c.who} · por {c.by} · {formatWhen(c.at)}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
