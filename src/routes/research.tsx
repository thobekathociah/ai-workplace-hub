import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Compass,
  HelpCircle,
  Library,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import {
  CopyButton,
  DraftBadge,
  EditToggle,
  EditableList,
  EditableText,
  SectionCard,
} from "@/components/EditableBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { research, type ResearchResult } from "@/lib/demo-ai";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace AI Assistant" },
      {
        name: "description",
        content:
          "Explore any topic with a structured draft: overview, key findings, important points, sources and follow-up questions.",
      },
      { property: "og:title", content: "AI Research Assistant — Workplace AI Assistant" },
      {
        property: "og:description",
        content: "Get an editable, clearly labelled research draft for any workplace topic.",
      },
    ],
  }),
  component: ResearchPage,
});

const SAMPLE = "How should mid-sized teams adopt AI assistants for internal productivity?";

function toText(r: ResearchResult) {
  return [
    "OVERVIEW",
    r.overview,
    "",
    "KEY FINDINGS",
    ...r.findings.map((x) => `• ${x}`),
    "",
    "IMPORTANT POINTS",
    ...r.importantPoints.map((x) => `• ${x}`),
    "",
    "SUGGESTED TOPICS / SOURCES",
    ...r.sources.map((x) => `• ${x}`),
    "",
    "FOLLOW-UP QUESTIONS",
    ...r.followUps.map((x) => `• ${x}`),
  ].join("\n");
}

function ResearchPage() {
  const [topic, setTopic] = useState(SAMPLE);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [variant, setVariant] = useState(0);

  async function run(next = variant) {
    if (!topic.trim()) return;
    setLoading(true);
    setEditing(false);
    setResult(await research(topic, next));
    setLoading(false);
  }

  return (
    <AppShell
      title="AI Research Assistant"
      description="Ask a question or name a topic — get a structured draft you can edit."
    >
      <div className="space-y-6">
        <SectionCard title="Research topic or question" icon={<BookOpen className="size-4" />}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
              placeholder="e.g. Best practices for hybrid team collaboration"
              className="h-11 min-w-0 rounded-xl"
            />
            <Button
              onClick={() => run()}
              disabled={loading || !topic.trim()}
              className="gradient-brand h-11 shrink-0 rounded-xl text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Researching…" : "Research"}
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setTopic("");
                setResult(null);
              }}
            >
              <Trash2 className="size-4" />
              Clear
            </Button>
            <Button variant="ghost" className="rounded-xl" onClick={() => setTopic(SAMPLE)}>
              Load sample
            </Button>
          </div>
        </SectionCard>

        {loading && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-card">
            <Loader2 className="mx-auto size-6 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Drafting your research brief…</p>
          </div>
        )}

        {result && !loading && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <DraftBadge />
              <div className="flex flex-wrap gap-2">
                <CopyButton value={toText(result)} label="Copy all" />
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
                <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setResult(null)}>
                  <Trash2 className="size-3.5" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <SectionCard
                title="Overview"
                icon={<Compass className="size-4" />}
                className="lg:col-span-2"
              >
                <EditableText
                  editing={editing}
                  value={result.overview}
                  onChange={(overview) => setResult({ ...result, overview })}
                />
              </SectionCard>

              <SectionCard title="Key Findings" icon={<Sparkles className="size-4" />}>
                <EditableList
                  editing={editing}
                  items={result.findings}
                  onChange={(findings) => setResult({ ...result, findings })}
                />
              </SectionCard>

              <SectionCard title="Important Points" icon={<Lightbulb className="size-4" />}>
                <EditableList
                  editing={editing}
                  items={result.importantPoints}
                  onChange={(importantPoints) => setResult({ ...result, importantPoints })}
                />
              </SectionCard>

              <SectionCard title="Suggested Topics & Sources" icon={<Library className="size-4" />}>
                <EditableList
                  editing={editing}
                  items={result.sources}
                  onChange={(sources) => setResult({ ...result, sources })}
                />
              </SectionCard>

              <SectionCard title="Follow-up Questions" icon={<HelpCircle className="size-4" />}>
                <EditableList
                  editing={editing}
                  items={result.followUps}
                  marker="number"
                  onChange={(followUps) => setResult({ ...result, followUps })}
                />
              </SectionCard>
            </div>
          </>
        )}

        {!result && !loading && (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <BookOpen className="mx-auto size-6 text-primary" />
            <p className="mt-3 font-display text-sm font-bold">No research draft yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter a topic or question to generate a structured draft.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
