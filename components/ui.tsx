"use client";

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { X } from "lucide-react";
import { cn, initials } from "@/lib/utils";

// Button ---------------------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  variant = "secondary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const styles: Record<ButtonVariant, string> = {
    primary: "bg-brand-primary text-white hover:opacity-90",
    secondary: "bg-surface text-ink border border-line hover:bg-paper",
    ghost: "text-ink hover:bg-ink/5",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}

// Card ---------------------------------------------------------------

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-line bg-surface p-5", className)} {...props} />;
}

// Badge ---------------------------------------------------------------

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

// Avatar ---------------------------------------------------------------

export function Avatar({ name, color, size = "sm" }: { name: string; color: string; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-7 w-7 text-xs" : "h-10 w-10 text-sm";
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white", dims)}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials(name) || "?"}
    </span>
  );
}

// Form fields ---------------------------------------------------------------

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none ring-brand-primary/30 focus:border-brand-primary focus:ring-2",
        className
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none ring-brand-primary/30 focus:border-brand-primary focus:ring-2",
          className
        )}
        {...props}
      />
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none ring-brand-primary/30 focus:border-brand-primary focus:ring-2",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  );
}

// Modal ---------------------------------------------------------------

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10 animate-fade-in sm:pt-16">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-inkmuted hover:bg-ink/5 hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

// Empty state ---------------------------------------------------------------

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line py-14 text-center">
      <p className="max-w-xs text-sm text-inkmuted">{message}</p>
      {action}
    </div>
  );
}

// KPI card ---------------------------------------------------------------

export function KpiCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  hint?: string;
}) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-inkmuted">{label}</span>
        {icon && <span className="text-brand-primary">{icon}</span>}
      </div>
      <span className="font-display text-2xl font-semibold text-inkstrong">{value}</span>
      {hint && <span className="text-xs text-inkmuted">{hint}</span>}
    </Card>
  );
}
