import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase de USO EXCLUSIVO en el servidor (Server Components,
 * Server Actions, Route Handlers). Las variables de entorno NO tienen el
 * prefijo NEXT_PUBLIC_ a propósito: nunca deben llegar al bundle del cliente.
 */
function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copiá .env.example a .env.local y completá los valores de tu proyecto de Supabase.`
    );
  }
  return value;
}

export function supabase() {
  return createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_ANON_KEY"), {
    auth: { persistSession: false },
  });
}
