"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, FolderKanban, CheckSquare } from "lucide-react";

export type SearchClient = { id: string; name: string; business_name: string | null };
export type SearchProject = { id: string; name: string };
export type SearchTask = { id: string; title: string };

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const MAX_PER_GROUP = 5;

export function GlobalSearch({
  clients,
  projects,
  tasks,
}: {
  clients: SearchClient[];
  projects: SearchProject[];
  tasks: SearchTask[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return null;

    const matchedClients = clients
      .filter((c) => normalize(c.name).includes(q) || (c.business_name && normalize(c.business_name).includes(q)))
      .slice(0, MAX_PER_GROUP);
    const matchedProjects = projects.filter((p) => normalize(p.name).includes(q)).slice(0, MAX_PER_GROUP);
    const matchedTasks = tasks.filter((t) => normalize(t.title).includes(q)).slice(0, MAX_PER_GROUP);

    return { clients: matchedClients, projects: matchedProjects, tasks: matchedTasks };
  }, [query, clients, projects, tasks]);

  const hasResults = results && (results.clients.length > 0 || results.projects.length > 0 || results.tasks.length > 0);

  function go(href: string) {
    router.push(href);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-[15rem] sm:max-w-xs">
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-inkmuted" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Buscar cliente, proyecto o tarea…"
          className="w-full rounded-lg border border-line bg-paper py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-inkmuted focus:border-brand-primary/50 focus:outline-none"
        />
      </div>

      {open && results && (
        <div className="absolute right-0 z-40 mt-1.5 max-h-96 w-80 overflow-y-auto rounded-xl border border-line bg-surface p-2 shadow-lg">
          {!hasResults && <p className="px-2 py-4 text-center text-xs text-inkmuted">Sin resultados</p>}

          {results.clients.length > 0 && (
            <div className="mb-1">
              <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-inkmuted">Clientes</p>
              {results.clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => go(`/clientes/${c.id}`)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-ink hover:bg-ink/5"
                >
                  <Users size={14} className="shrink-0 text-inkmuted" />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          )}

          {results.projects.length > 0 && (
            <div className="mb-1">
              <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-inkmuted">Proyectos</p>
              {results.projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => go(`/proyectos?project=${p.id}`)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-ink hover:bg-ink/5"
                >
                  <FolderKanban size={14} className="shrink-0 text-inkmuted" />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          )}

          {results.tasks.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-inkmuted">Tareas</p>
              {results.tasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => go(`/proyectos?task=${t.id}`)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-ink hover:bg-ink/5"
                >
                  <CheckSquare size={14} className="shrink-0 text-inkmuted" />
                  <span className="truncate">{t.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
