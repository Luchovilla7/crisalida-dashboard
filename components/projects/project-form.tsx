"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { agency } from "@/config/agency";
import { Button, Field, Input, Modal, Select } from "@/components/ui";
import { createProject, deleteProject, updateProject, type ProjectInput } from "@/lib/actions";
import type { Client, Project } from "@/lib/types";

const PROJECT_STATUSES = [
  { id: "activo", label: "Activo" },
  { id: "en-pausa", label: "En pausa" },
  { id: "finalizado", label: "Finalizado" },
];

export function ProjectForm({
  open,
  onClose,
  project,
  clients,
}: {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
  clients: Client[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<ProjectInput>(() => ({
    name: project?.name ?? "",
    client_id: project?.client_id ?? "",
    status: project?.status ?? "activo",
    start_date: project?.start_date ?? "",
    due_date: project?.due_date ?? "",
  }));

  function submit() {
    if (!form.name.trim()) return;
    startTransition(async () => {
      if (project) {
        await updateProject(project.id, form);
      } else {
        await createProject(form);
      }
      router.refresh();
      onClose();
    });
  }

  function remove() {
    if (!project) return;
    if (!confirm("¿Eliminar este proyecto? Las tareas asociadas quedarán sin proyecto.")) return;
    startTransition(async () => {
      await deleteProject(project.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={project ? "Editar proyecto" : agency.copy.cta.newProject}>
      <div className="space-y-4">
        <Field label="Nombre *">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
        </Field>

        <Field label="Cliente">
          <Select value={form.client_id ?? ""} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
            <option value="">Sin cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Estado">
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha de inicio">
            <Input
              type="date"
              value={form.start_date ?? ""}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </Field>
          <Field label="Fecha de entrega">
            <Input
              type="date"
              value={form.due_date ?? ""}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between pt-2">
          {project ? (
            <Button variant="danger" onClick={remove} disabled={pending}>
              {agency.copy.cta.delete}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              {agency.copy.cta.cancel}
            </Button>
            <Button variant="primary" onClick={submit} disabled={pending}>
              {agency.copy.cta.save}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
