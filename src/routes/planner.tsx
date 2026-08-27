import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Loader2, ListChecks, Plus, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { CopyButton, DraftBadge, EditToggle, SectionCard } from "@/components/EditableBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { planTasks, type PlannedTask } from "@/lib/demo-ai";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Workplace AI Assistant" },
      {
        name: "description",
        content:
          "Turn a goal, project or task list into an editable plan with priorities, deadlines, status and next steps.",
      },
      { property: "og:title", content: "AI Task Planner — Workplace AI Assistant" },
      {
        property: "og:description",
        content: "Generate a sequenced, editable task plan from any goal or project brief.",
      },
    ],
  }),
  component: PlannerPage,
});

const SAMPLE = `Launch a self-serve onboarding revamp for new customers in Q3
Reduce step-3 drop-off below 20%
Ship revised empty states and welcome email sequence
Set up weekly activation reporting`;

const PRIORITIES = ["High", "Medium", "Low"] as const;
const STATUSES = ["Not started", "In progress", "Blocked", "Done"] as const;

const priorityClass: Record<PlannedTask["priority"], string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "gradient-soft text-primary",
  Low: "bg-muted text-muted-foreground",
};

function toText(tasks: PlannedTask[]) {
  return tasks
    .map(
      (t, i) =>
        `${i + 1}. ${t.name}\n   ${t.description}\n   Priority: ${t.priority} | Deadline: ${t.deadline} | Status: ${t.status}\n   Next step: ${t.nextStep}`,
    )
    .join("\n\n");
}

function PlannerPage() {
  const [goal, setGoal] = useState(SAMPLE);
  const [tasks, setTasks] = useState<PlannedTask[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [variant, setVariant] = useState(0);

  async function run(next = variant) {
    if (!goal.trim()) return;
    setLoading(true);
    setEditing(false);
    setTasks(await planTasks(goal, next));
    setLoading(false);
  }

  function update(id: string, patch: Partial<PlannedTask>) {
    setTasks((prev) => prev?.map((t) => (t.id === id ? { ...t, ...patch } : t)) ?? prev);
  }

  return (
    <AppShell
      title="AI Task Planner"
      description="Describe a goal or paste a task list — get a sequenced, editable plan."
    >
      <div className="space-y-6">
        <SectionCard title="Goal, project or task list" icon={<ListChecks className="size-4" />}>
          <Textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Launch the new customer onboarding flow by end of quarter…"
            className="min-h-40 rounded-xl text-sm"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => run()}
              disabled={loading || !goal.trim()}
              className="gradient-brand rounded-xl text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Planning…" : "Generate plan"}
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setGoal("");
                setTasks(null);
              }}
            >
              <Trash2 className="size-4" />
              Clear
            </Button>
            <Button variant="ghost" className="rounded-xl" onClick={() => setGoal(SAMPLE)}>
              Load sample
            </Button>
          </div>
        </SectionCard>

        {loading && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-card">
            <Loader2 className="mx-auto size-6 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Sequencing your tasks…</p>
          </div>
        )}

        {tasks && !loading && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <DraftBadge />
              <div className="flex flex-wrap gap-2">
                <CopyButton value={toText(tasks)} label="Copy plan" />
                <EditToggle editing={editing} setEditing={setEditing} />
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => {
                    const next = variant + 1;
                    setVariant(next);
                    run(next);
                  }}
                >
                  <RefreshCw className="size-3.5" />
                  Regenerate
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setTasks(null)}>
                  <Trash2 className="size-3.5" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {tasks.map((task, i) => (
                <article
                  key={task.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                        Task {i + 1}
                      </p>
                      {editing ? (
                        <Input
                          value={task.name}
                          onChange={(e) => update(task.id, { name: e.target.value })}
                          className="mt-1 rounded-lg font-semibold"
                        />
                      ) : (
                        <h3 className="mt-1 font-display text-base font-extrabold">{task.name}</h3>
                      )}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1 text-xs font-bold",
                        priorityClass[task.priority],
                      )}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {editing ? (
                    <Textarea
                      value={task.description}
                      onChange={(e) => update(task.id, { description: e.target.value })}
                      className="mt-3 min-h-20 rounded-xl text-sm"
                    />
                  ) : (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <label className="min-w-0 text-xs">
                      <span className="font-bold text-muted-foreground">Priority</span>
                      <select
                        value={task.priority}
                        onChange={(e) =>
                          update(task.id, { priority: e.target.value as PlannedTask["priority"] })
                        }
                        className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </label>
                    <label className="min-w-0 text-xs">
                      <span className="font-bold text-muted-foreground">Deadline</span>
                      <Input
                        value={task.deadline}
                        onChange={(e) => update(task.id, { deadline: e.target.value })}
                        className="mt-1 h-9 rounded-lg text-sm"
                      />
                    </label>
                    <label className="min-w-0 text-xs">
                      <span className="font-bold text-muted-foreground">Status</span>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          update(task.id, { status: e.target.value as PlannedTask["status"] })
                        }
                        className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        {STATUSES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="mt-4 flex items-start gap-2 rounded-xl gradient-soft p-3">
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-primary">Next step</p>
                      {editing ? (
                        <Input
                          value={task.nextStep}
                          onChange={(e) => update(task.id, { nextStep: e.target.value })}
                          className="mt-1 h-9 rounded-lg text-sm"
                        />
                      ) : (
                        <p className="text-sm text-foreground/80">{task.nextStep}</p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() =>
                setTasks([
                  ...tasks,
                  {
                    id: `${Date.now()}`,
                    name: "New task",
                    description: "Describe the outcome and definition of done.",
                    priority: "Medium",
                    deadline: "—",
                    status: "Not started",
                    nextStep: "Assign an owner.",
                  },
                ])
              }
            >
              <Plus className="size-4" />
              Add task
            </Button>
          </>
        )}

        {!tasks && !loading && (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <ListChecks className="mx-auto size-6 text-primary" />
            <p className="mt-3 font-display text-sm font-bold">No plan yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe what you want to achieve and generate a structured plan.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
