import "server-only";
import { supabase } from "@/lib/supabase";
import { agency } from "@/config/agency";
import type { Client, ClientLink, ClientNote, Lead, Payment, Project, Task, ActivityLog, Service } from "@/lib/types";

async function run<T>(promise: PromiseLike<{ data: T | null; error: { message: string } | null }>, fallback: T): Promise<T> {
  const { data, error } = await promise;
  if (error) {
    console.error("[supabase]", error.message);
    return fallback;
  }
  return data ?? fallback;
}

export async function getClients(): Promise<Client[]> {
  return run(supabase().from("clients").select("*").order("created_at", { ascending: false }), []);
}

export async function getClient(id: string): Promise<Client | null> {
  return run(supabase().from("clients").select("*").eq("id", id).maybeSingle(), null);
}

export async function getClientNotes(clientId: string): Promise<ClientNote[]> {
  return run(
    supabase().from("client_notes").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
    []
  );
}

export async function getClientLinks(clientId: string): Promise<ClientLink[]> {
  return run(
    supabase().from("client_links").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
    []
  );
}

export async function getLeads(): Promise<Lead[]> {
  return run(supabase().from("leads").select("*").order("position", { ascending: true }), []);
}

export async function getProjects(): Promise<Project[]> {
  return run(supabase().from("projects").select("*").order("created_at", { ascending: false }), []);
}

export async function getTasks(): Promise<Task[]> {
  return run(supabase().from("tasks").select("*").order("position", { ascending: true }), []);
}

export async function getPayments(): Promise<Payment[]> {
  return run(supabase().from("payments").select("*").order("month", { ascending: false }), []);
}

export async function getActivity(limit = 15): Promise<ActivityLog[]> {
  return run(supabase().from("activity_log").select("*").order("created_at", { ascending: false }).limit(limit), []);
}

export async function getServices(): Promise<Service[]> {
  const dbServices = await run<Service[]>(
    supabase().from("services").select("*").order("created_at", { ascending: true }),
    []
  );
  if (dbServices.length > 0) return dbServices;
  return agency.services as Service[];
}

