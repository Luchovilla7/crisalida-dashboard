import { agency } from "@/config/agency";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-lg font-semibold text-white">
            {agency.name.charAt(0)}
          </div>
          <h1 className="font-display text-lg font-semibold text-inkstrong">{agency.name}</h1>
          <p className="mt-1 text-sm text-inkmuted">Dashboard interno</p>
        </div>

        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="next" value={params.next || "/"} />
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoFocus
              required
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none ring-brand-primary/30 focus:border-brand-primary focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none ring-brand-primary/30 focus:border-brand-primary focus:ring-2"
            />
          </div>

          {params.error && (
            <p className="text-sm text-red-500">Email o contraseña incorrectos. Probá de nuevo.</p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
