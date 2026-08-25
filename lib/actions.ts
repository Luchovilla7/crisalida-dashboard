"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { ChecklistItem } from "@/lib/types";

// Los <select>/<input type="date"> vacíos mandan "" en vez de omitir el campo.
// Postgres rechaza "" para columnas date/uuid (solo acepta NULL), así que estas
// claves se normalizan a null antes de cada insert/update.
function nullifyEmpty<T extends object>(input: T, keys: (keyof T)[]): T {
  const copy: T = { ...input };
  for (const key of keys) {
    if (copy[key] === "") copy[key] = null as T[keyof T];
  }
  return copy;
}

async function logActivity(kind: string, message: string) {
  await supabase().from("activity_log").insert({ kind, message });
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/clientes");
  revalidatePath("/pipeline");
  revalidatePath("/proyectos");
  revalidatePath("/finanzas");
  revalidatePath("/servicios");
  revalidatePath("/equipo");
  revalidatePath("/calendario");
}

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

export type ClientInput = {
  name: string;
  business_name?: string | null;
  service_ids: string[];
  status: string;
  contract_value: number;
  currency: string;
  start_date?: string | null;
  assigned_to?: string | null;
  notes?: string | null;
};

export async function createClient(input: ClientInput) {
  const { data, error } = await supabase()
    .from("clients")
    .insert(nullifyEmpty(input, ["start_date"]))
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  await logActivity("cliente_nuevo", `Nuevo cliente: ${input.name}`);
  revalidateAll();
  return data.id as string;
}

export async function updateClient(id: string, input: Partial<ClientInput>) {
  const { error } = await supabase()
    .from("clients")
    .update({ ...nullifyEmpty(input, ["start_date"]), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  if (input.status) {
    await logActivity("cliente_estado", `Cliente actualizado a estado "${input.status}"`);
  }
  revalidateAll();
  revalidatePath(`/clientes/${id}`);
}

export async function deleteClient(id: string) {
  const { error } = await supabase().from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function addClientNote(clientId: string, body: string) {
  const { error } = await supabase().from("client_notes").insert({ client_id: clientId, body });
  if (error) throw new Error(error.message);
  revalidatePath(`/clientes/${clientId}`);
}

export async function addClientLink(clientId: string, label: string, url: string) {
  const { error } = await supabase().from("client_links").insert({ client_id: clientId, label, url });
  if (error) throw new Error(error.message);
  revalidatePath(`/clientes/${clientId}`);
}

// ---------------------------------------------------------------------------
// Pipeline (leads)
// ---------------------------------------------------------------------------

export type LeadInput = {
  name: string;
  business_name?: string | null;
  stage_id: string;
  estimated_value: number;
  probability: number;
  assigned_to?: string | null;
  service_id?: string | null;
  notes?: string | null;
};

export async function createLead(input: LeadInput) {
  const { error } = await supabase().from("leads").insert({ ...input, position: Date.now() });
  if (error) throw new Error(error.message);
  await logActivity("lead_nuevo", `Nuevo prospecto en pipeline: ${input.name}`);
  revalidateAll();
}

export async function updateLead(id: string, input: Partial<LeadInput>) {
  const { error } = await supabase()
    .from("leads")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deleteLead(id: string) {
  const { error } = await supabase().from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function moveLead(id: string, stageId: string, position: number) {
  const { error } = await supabase().from("leads").update({ stage_id: stageId, position }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Proyectos
// ---------------------------------------------------------------------------

export type ProjectInput = {
  name: string;
  client_id?: string | null;
  status: string;
  start_date?: string | null;
  due_date?: string | null;
};

const PROJECT_NULLABLE = ["client_id", "start_date", "due_date"] as const;

export async function createProject(input: ProjectInput) {
  const { error } = await supabase().from("projects").insert(nullifyEmpty(input, [...PROJECT_NULLABLE]));
  if (error) throw new Error(error.message);
  await logActivity("proyecto_nuevo", `Nuevo proyecto: ${input.name}`);
  revalidateAll();
}

export async function updateProject(id: string, input: Partial<ProjectInput>) {
  const { error } = await supabase()
    .from("projects")
    .update({ ...nullifyEmpty(input, [...PROJECT_NULLABLE]), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deleteProject(id: string) {
  const { error } = await supabase().from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

// ---------------------------------------------------------------------------
// Tareas
// ---------------------------------------------------------------------------

export type TaskInput = {
  title: string;
  project_id?: string | null;
  client_id?: string | null;
  assigned_to?: string | null;
  due_date?: string | null;
  priority: string;
  stage_id: string;
  checklist?: ChecklistItem[];
};

const TASK_NULLABLE = ["project_id", "client_id", "due_date"] as const;

export async function createTask(input: TaskInput) {
  const { error } = await supabase()
    .from("tasks")
    .insert({ ...nullifyEmpty(input, [...TASK_NULLABLE]), checklist: input.checklist ?? [], position: Date.now() });
  if (error) throw new Error(error.message);
  await logActivity("tarea_nueva", `Nueva tarea: ${input.title}`);
  revalidateAll();
}

export async function updateTask(id: string, input: Partial<TaskInput>) {
  const { error } = await supabase()
    .from("tasks")
    .update({ ...nullifyEmpty(input, [...TASK_NULLABLE]), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deleteTask(id: string) {
  const { error } = await supabase().from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function moveTask(id: string, stageId: string, position: number, taskTitle?: string) {
  const isDelivered = stageId === "entregado";
  const { error } = await supabase()
    .from("tasks")
    .update({ stage_id: stageId, position, completed_at: isDelivered ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  if (isDelivered && taskTitle) {
    await logActivity("tarea_completada", `Tarea entregada: ${taskTitle}`);
  }
  revalidatePath("/proyectos");
  revalidatePath("/");
  revalidatePath("/equipo");
}

export async function toggleChecklistItem(taskId: string, checklist: ChecklistItem[]) {
  const { error } = await supabase().from("tasks").update({ checklist }).eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath("/proyectos");
}

// ---------------------------------------------------------------------------
// Pagos / Finanzas
// ---------------------------------------------------------------------------

export type PaymentInput = {
  client_id?: string | null;
  service_id?: string | null;
  amount: number;
  currency: string;
  month: string;
  status: "pendiente" | "cobrado";
  is_retainer: boolean;
};

export async function createPayment(input: PaymentInput) {
  const { error } = await supabase().from("payments").insert(nullifyEmpty(input, ["client_id"]));
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function updatePayment(id: string, input: Partial<PaymentInput>) {
  const { error } = await supabase()
    .from("payments")
    .update(nullifyEmpty(input, ["client_id"]))
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deletePayment(id: string) {
  const { error } = await supabase().from("payments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

// ---------------------------------------------------------------------------
// Servicios
// ---------------------------------------------------------------------------

export type ServiceInput = {
  name: string;
  description: string;
  price: string;
  currency: string;
  type: "proyecto" | "retainer";
};

export async function createService(input: ServiceInput) {
  const { error } = await supabase().from("services").insert(input);
  if (error) throw new Error(error.message);
  await logActivity("servicio_nuevo", `Nuevo servicio en catálogo: ${input.name}`);
  revalidateAll();
}

export async function updateService(id: string, input: Partial<ServiceInput>) {
  const { error } = await supabase()
    .from("services")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  if (input.name) {
    await logActivity("servicio_editado", `Servicio actualizado: ${input.name}`);
  }
  revalidateAll();
}

export async function deleteService(id: string, serviceName?: string) {
  const { error } = await supabase().from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logActivity("servicio_eliminado", `Servicio eliminado: ${serviceName || id}`);
  revalidateAll();
}

