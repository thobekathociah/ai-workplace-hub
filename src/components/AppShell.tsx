import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Sparkles, FileText, ListChecks, BookOpen, ShieldAlert, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { AI_DISCLAIMER } from "@/lib/demo-ai";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Meeting Notes", icon: FileText, hint: "Summarise & structure" },
  { to: "/planner", label: "Task Planner", icon: ListChecks, hint: "Plan & sequence" },
  { to: "/research", label: "Research Assistant", icon: BookOpen, hint: "Explore a topic" },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, hint }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
              active
                ? "gradient-brand text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{label}</span>
              <span
                className={cn(
                  "block truncate text-xs",
                  active ? "opacity-80" : "text-muted-foreground/80",
                )}
              >
                {hint}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="gradient-brand grid size-10 shrink-0 place-items-center rounded-xl shadow-glow">
        <Sparkles className="size-5 text-primary-foreground" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-display text-sm font-extrabold">
          Workplace AI
        </span>
        <span className="block truncate text-xs text-muted-foreground">Productivity Assistant</span>
      </span>
    </div>
  );
}

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-sidebar-border bg-sidebar p-5 lg:flex">
        <Brand />
        <div className="mt-8">
          <p className="px-3 pb-2 text-[0.68rem] font-bold tracking-[0.14em] text-muted-foreground uppercase">
            Tools
          </p>
          <NavLinks />
        </div>
        <div className="mt-auto rounded-xl gradient-soft p-4">
          <p className="font-display text-sm font-bold">Demo mode</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Responses are simulated samples generated locally — no account or backend needed.
          </p>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-sidebar p-5 shadow-card">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-sidebar-accent"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-8">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto grid max-w-6xl grid-cols-[auto_minmax(0,1fr)] items-center gap-3 px-4 py-4 sm:px-6">
            <button
              onClick={() => setOpen(true)}
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-border hover:bg-accent lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-extrabold sm:text-xl">{title}</h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">{description}</p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>

        <footer className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted-foreground">{AI_DISCLAIMER}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
