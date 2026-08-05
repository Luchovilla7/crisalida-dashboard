import { agency } from "@/config/agency";

export function getService(id: string | null | undefined) {
  return agency.services.find((s) => s.id === id) ?? null;
}

export function getTeamMember(id: string | null | undefined) {
  return agency.team.find((m) => m.id === id) ?? null;
}

export function getClientStatus(id: string | null | undefined) {
  return agency.clientStatuses.find((s) => s.id === id) ?? agency.clientStatuses[0];
}

export function getPriority(id: string | null | undefined) {
  return agency.priorities.find((p) => p.id === id) ?? agency.priorities[1];
}

export function getPipelineStage(id: string) {
  return agency.pipelineStages.find((s) => s.id === id) ?? agency.pipelineStages[0];
}

export function getTaskStage(id: string) {
  return agency.taskStages.find((s) => s.id === id) ?? agency.taskStages[0];
}
