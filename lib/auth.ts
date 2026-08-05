// Nota: este modulo lo usa proxy.ts (Edge runtime), por eso usa la Web Crypto
// API global (crypto.subtle) en vez de "node:crypto".
import { agency } from "@/config/agency";

export const SESSION_COOKIE = "cc_session";

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// Cada persona del equipo (config/agency.ts -> team) entra con su propio email,
// pero todos comparten la misma DASHBOARD_PASSWORD: no hay altas de usuario ni
// contraseñas individuales, solo identifica quién es quién dentro del dashboard.
export function findTeamMemberByEmail(email: string) {
  const target = normalizeEmail(email);
  return agency.team.find((m) => normalizeEmail(m.email) === target) ?? null;
}

function checkPassword(input: string) {
  const expected = process.env.DASHBOARD_PASSWORD || "";
  if (!expected) return false;
  return input === expected;
}

export function checkCredentials(email: string, password: string) {
  if (!checkPassword(password)) return null;
  return findTeamMemberByEmail(email);
}

// La cookie de sesión guarda "<idDeMiembro>.<firma>": la firma prueba que el
// valor salió del servidor (nadie puede escribir la cookie a mano para
// hacerse pasar por otro miembro sin conocer SESSION_SECRET).
async function signUserId(userId: string) {
  const secret = process.env.SESSION_SECRET || "dev-secret-cambiame";
  return sha256Hex(`${userId}:${secret}`);
}

export async function sessionCookieValue(userId: string) {
  return `${userId}.${await signUserId(userId)}`;
}

export async function verifySessionCookie(value: string | undefined) {
  if (!value) return null;
  const separatorIndex = value.lastIndexOf(".");
  if (separatorIndex === -1) return null;
  const userId = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);
  const expected = await signUserId(userId);
  return signature === expected ? userId : null;
}
