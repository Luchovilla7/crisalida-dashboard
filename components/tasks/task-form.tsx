"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { agency } from "@/config/agency";
import { Button, Field, Input, Modal, Select } from "@/components/ui";
import { createTask, deleteTask, updateTask, type TaskInput } from "@/lib/actions";
import type { ChecklistItem, Client, Project, Task } from "@/lib/types";

export function TaskForm({
  open,
  onClose,
  task,
  projects,
  clients,
  initialStage,
}: {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  projects: Project[];
  clients: Client[];
  initialStage?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<TaskInput>(() => ({
    title: task?.title ?? "",
    project_id: task?.project_id ?? "",
    client_id: task?.client_id ?? "",
    assigned_to: task?.assigned_to ?? "",
    due_date: task?.due_date ?? "",
    priority: task?.priority ?? "media",
    stage_id: task?.stage_id ?? initialStage ?? agency.taskStages[0].id,
    checklist: task?.checklist ?? [],
  }));
  const [newItem, setNewItem] = useState("");

  function addChecklistItem() {
    if (!newItem.trim()) return;
    const item: ChecklistItem = { id: crypto.randomUUID(), label: newItem.trim(), done: false };
    setForm((f) => ({ ...f, checklist: [...(f.checklist ?? []), item] }));
    setNewItem("");
  }

  function toggleItem(id: string) {
    setForm((f) => ({
      ...f,
      checklist: (f.checklist ?? []).map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    }));
  }

  function removeItem(id: string) {
    setForm((f) => ({ ...f, checklist: (f.checklist ?? []).filter((i) => i.id !== id) }));
  }

  function submit() {
    if (!form.title.trim()) return;
    startTransition(async () => {
      if (task) {
        await updateTask(task.id, form);
      } else {
        await createTask(form);
      }
      router.refresh();
      onClose();
    });
  }

  function remove() {
    if (!task) return;
    if (!confirm("¿Eliminar esta tarea?")) return;
    startTransition(async () => {
      await deleteTask(task.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={task ? "Editar tarea" : agency.copy.cta.newTask}>
      <div className="space-y-4">
        <Field label="Título *">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Proyecto">
            <Select value={form.project_id ?? ""} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
              <option value="">Sin proyecto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
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
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Asignado a">
            <Select value={form.assigned_to ?? ""} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
              <option value="">Sin asignar</option>
              {agency.team.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Prioridad">
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {agency.priorities.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha límite">
            <Input type="date" value={form.due_date ?? ""} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </Field>
          <Field label="Columna">
            <Select value={form.stage_id} onChange={(e) => setForm({ ...form, stage_id: e.target.value })}>
              {agency.taskStages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Checklist (opcional)">
          <div className="space-y-1.5">
            {(form.checklist ?? []).map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input type="checkbox" checked={item.done} onChange={() => toggleItem(item.id)} className="h-4 w-4 accent-brand-primary" />
                <span className={`flex-1 text-sm ${item.done ? "text-inkmuted line-through" : "text-ink"}`}>
                  {item.label}
                </span>
                <button onClick={() => removeItem(item.id)} className="text-inkmuted hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Input
                placeholder="Agregar ítem…"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChecklistItem())}
              />
              <Button variant="secondary" onClick={addChecklistItem}>
                <Plus size={14} />
              </Button>
            </div>
          </div>
        </Field>

        <div className="flex items-center justify-between pt-2">
          {task ? (
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
