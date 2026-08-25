export type Client = {
  id: string;
  name: string;
  business_name: string | null;
  service_ids: string[];
  status: string;
  contract_value: number;
  currency: string;
  start_date: string | null;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientNote = {
  id: string;
  client_id: string;
  body: string;
  created_at: string;
};

export type ClientLink = {
  id: string;
  client_id: string;
  label: string;
  url: string;
  created_at: string;
};

export type Lead = {
  id: string;
  name: string;
  business_name: string | null;
  stage_id: string;
  position: number;
  estimated_value: number;
  probability: number;
  assigned_to: string | null;
  service_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  client_id: string | null;
  status: string;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type ChecklistItem = { id: string; label: string; done: boolean };

export type Task = {
  id: string;
  title: string;
  project_id: string | null;
  client_id: string | null;
  assigned_to: string | null;
  due_date: string | null;
  priority: string;
  stage_id: string;
  position: number;
  checklist: ChecklistItem[];
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  client_id: string | null;
  service_id: string | null;
  amount: number;
  currency: string;
  month: string;
  status: "pendiente" | "cobrado";
  is_retainer: boolean;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  kind: string;
  message: string;
  created_at: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  type: "proyecto" | "retainer";
  created_at?: string;
  updated_at?: string;
};
