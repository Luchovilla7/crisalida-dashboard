"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { agency } from "@/config/agency";
import { Badge, Button, Card, EmptyState, Input, Textarea } from "@/components/ui";
import { getClientStatus, getService, getTeamMember } from "@/lib/config-helpers";
import { formatDate, formatMoney, formatRelative } from "@/lib/format";
import { addClientLink, addClientNote } from "@/lib/actions";
import type { Client, ClientLink, ClientNote, Service } from "@/lib/types";
import { ClientForm } from "./client-form";

export function ClientDetail({
  client,
  notes,
  links,
  services,
}: {
  client: Client;
  notes: ClientNote[];
  links: ClientLink[];
  services?: Service[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [pending, startTransition] = useTransition();

  const status = getClientStatus(client.status);
  const responsible = getTeamMember(client.assigned_to);

  function submitNote() {
    if (!noteBody.trim()) return;
    startTransition(async () => {
      await addClientNote(client.id, noteBody.trim());
      setNoteBody("");
      router.refresh();
    });
  }

  function submitLink() {
    if (!linkLabel.trim() || !linkUrl.trim()) return;
    startTransition(async () => {
      await addClientLink(client.id, linkLabel.trim(), linkUrl.trim());
      setLinkLabel("");
      setLinkUrl("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/clientes" className="inline-flex items-center gap-1.5 text-sm text-inkmuted hover:text-ink">
          <ArrowLeft size={15} /> Volver a clientes
        </Link>
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          <Pencil size={14} /> {agency.copy.cta.edit}
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-inkstrong">{client.name}</h1>
            {client.business_name && <p className="text-sm text-inkmuted">{client.business_name}</p>}
          </div>
          <Badge label={status.label} color={status.color} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-inkmuted">Valor del contrato</p>
            <p className="text-sm font-medium text-ink">{formatMoney(client.contract_value, client.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-inkmuted">Inicio</p>
            <p className="text-sm font-medium text-ink">{formatDate(client.start_date)}</p>
          </div>
          <div>
            <p className="text-xs text-inkmuted">Responsable</p>
            <p className="text-sm font-medium text-ink">{responsible ? responsible.name : "Sin asignar"}</p>
          </div>
          <div>
            <p className="text-xs text-inkmuted">Servicios</p>
            <div className="mt-0.5 flex flex-wrap gap-1">
              {client.service_ids.length === 0 && <span className="text-sm text-inkmuted">—</span>}
              {client.service_ids.map((id) => {
                const svc = getService(id, services);
                return svc ? (
                  <span key={id} className="rounded-full bg-line/40 px-2 py-0.5 text-[11px] text-ink">
                    {svc.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {client.notes && (
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-xs text-inkmuted">Notas generales</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{client.notes}</p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-sm font-semibold text-ink">Archivos y links</h2>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <Input placeholder="Etiqueta" value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} />
            <Input placeholder="https://…" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
            <Button variant="secondary" onClick={submitLink} disabled={pending}>
              <Plus size={14} /> {agency.copy.cta.addLink}
            </Button>
          </div>
          {links.length === 0 ? (
            <EmptyState message="Todavía no agregaste archivos o links." />
          ) : (
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-brand-primary hover:underline"
                  >
                    <ExternalLink size={14} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-display text-sm font-semibold text-ink">Historial de interacciones</h2>
          <div className="mb-4 flex flex-col gap-2">
            <Textarea rows={2} placeholder="Agregar una nota…" value={noteBody} onChange={(e) => setNoteBody(e.target.value)} />
            <Button variant="secondary" className="self-end" onClick={submitNote} disabled={pending}>
              <Plus size={14} /> {agency.copy.cta.addNote}
            </Button>
          </div>
          {notes.length === 0 ? (
            <EmptyState message="Todavía no hay interacciones registradas." />
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li key={note.id} className="border-b border-line pb-3 last:border-0">
                  <p className="text-sm text-ink">{note.body}</p>
                  <p className="mt-1 text-xs text-inkmuted">{formatRelative(note.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <ClientForm key={client?.id ?? "new"} open={editOpen} onClose={() => setEditOpen(false)} client={client} services={services} />
    </div>
  );
}
