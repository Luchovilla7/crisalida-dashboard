"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Package,
  Wallet,
  UsersRound,
  CalendarDays,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { agency } from "@/config/agency";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: agency.copy.nav.overview, icon: LayoutDashboard },
  { href: "/clientes", label: agency.copy.nav.clients, icon: Users },
  { href: "/proyectos", label: agency.copy.nav.projects, icon: FolderKanban },
  { href: "/servicios", label: agency.copy.nav.services, icon: Package },
  { href: "/finanzas", label: agency.copy.nav.finance, icon: Wallet },
  { href: "/equipo", label: agency.copy.nav.team, icon: UsersRound },
  { href: "/calendario", label: agency.copy.nav.calendar, icon: CalendarDays },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Image
          src="/images/logo.png"
          alt={agency.name}
          width={32}
          height={32}
          className="h-8 w-8 rounded-lg object-contain"
        />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-ink">{agency.name}</p>
          <p className="truncate text-xs text-inkmuted">{agency.tagline}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                active ? "bg-brand-primary/10 text-brand-primary" : "text-ink hover:bg-ink/5"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <a
          href="/logout"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-inkmuted hover:bg-ink/5"
        >
          <LogOut size={17} />
          Cerrar sesión
        </a>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const current = nav.find((item) => item.href === pathname);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-line md:block">
        <div className="fixed h-screen w-64">
          <SidebarContent />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-surface shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-inkmuted hover:bg-ink/5"
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/80 px-4 py-3.5 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 text-inkmuted hover:bg-ink/5 md:hidden"
            >
              <Menu size={19} />
            </button>
            <h1 className="font-display text-base font-semibold text-inkstrong">
              {current?.label ?? agency.name}
            </h1>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
