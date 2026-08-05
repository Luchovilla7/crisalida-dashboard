import { Shell } from "@/components/shell";

// Todas las paginas del dashboard leen datos en vivo de Supabase: nunca deben
// pre-renderizarse como estaticas en build time.
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
