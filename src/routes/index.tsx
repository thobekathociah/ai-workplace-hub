import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarClock,
  CheckSquare,
  FileText,
  Gavel,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import {
  CopyButton,
  DraftBadge,
  EditToggle,
  EditableList,
  EditableText,
  SectionCard,
} from "@/components/EditableBlock";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { summariseMeeting, type MeetingResult } from "@/lib/demo-ai";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Workplace AI Assistant" },
      {
        name: "description",
        content:
          "Turn raw meeting notes into a structured summary with key points, action items, decisions and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Workplace AI Assistant" },
      {
        property: "og:description",
        content:
          "Paste meeting notes and get an editable summary with key points, action items, decisions and deadlines.",
      },
    ],
  }),
  component: MeetingNotesPage,
});

const SAMPLE = `Weekly product sync — Q3 onboarding revamp
Attendees: Thabo (PM), Lerato (Design), Sam (Eng), Priya (Data)
Sam reported the new signup flow is behind by two days due to an email service dependency.
Lerato shared the revised empty-state designs; team liked direction, minor copy tweaks needed.
Priya showed drop-off is highest on step 3 of onboarding (41%).
Agreed to cut the optional profile step from v1 and revisit later.
Thabo will send the recap and update the roadmap board.`;

function toText(r: MeetingResult) {
  return [
    "MEETING SUMMARY",
    r.summary,
    "",
    "KEY POINTS",
    ...r.keyPoints.map((x) => `• ${x}`),
    "",
    "ACTION ITEMS",
    ...r.actionItems.map((x) => `• ${x}`),
    "",
    "DECISIONS MADE",
    ...r.decisions.map((x) => `• ${x}`),
    "",
    "DEADLINES",
    ...r.deadlines.map((x) => `• ${x}`),
  ].join("\n");
}

function MeetingNotesPage() {
  const [notes, setNotes] = useState(SAMPLE);
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [variant, setVariant] = useState(0);

  async function run(next = variant) {
    if (!notes.trim()) return;
    setLoading(true);
    setEditing(false);
    setResult(await summariseMeeting(notes, next));
    setLoading(false);
  }

  return (
    <AppShell
      title="Meeting Notes Summarizer"
      description="Paste your notes and get a structured, editable recap in seconds."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <SectionCard title="Your meeting notes" icon={<FileText className="size-4" />}>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste raw meeting notes, transcript fragments or bullet points…"
            className="min-h-72 rounded-xl text-sm"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => run()}
              disabled={loading || !notes.trim()}
              className="gradient-brand rounded-xl text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Summarizing…" : "Summarize"}
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setNotes("");
                setResult(null);
              }}
            >
              <Trash2 className="size-4" />
              Clear
            </Button>
            <Button variant="ghost" className="rounded-xl" onClick={() => setNotes(SAMPLE)}>
              Load sample
            </Button>
          </div>
        </SectionCard>

        <div className="space-y-5">
          {!result && !loading && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
              <Sparkles className="mx-auto size-6 text-primary" />
              <p className="mt-3 font-display text-sm font-bold">No summary yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your notes and press Summarize to see the structured output.
              </p>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-card">
              <Loader2 className="mx-auto size-6 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">Structuring your notes…</p>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => setResult(null)}
                  >
                    <Trash2 className="size-3.5" />
                    Clear
                  </Button>
                </div>
              </div>

              <SectionCard title="Meeting Summary" icon={<FileText className="size-4" />}>
                <EditableText
                  editing={editing}
                  value={result.summary}
                  onChange={(summary) => setResult({ ...result, summary })}
                />
              </SectionCard>

              <SectionCard title="Key Points" icon={<Sparkles className="size-4" />}>
                <EditableList
                  editing={editing}
                  items={result.keyPoints}
                  onChange={(keyPoints) => setResult({ ...result, keyPoints })}
                />
              </SectionCard>

              <SectionCard title="Action Items" icon={<CheckSquare className="size-4" />}>
                <EditableList
                  editing={editing}
                  items={result.actionItems}
                  onChange={(actionItems) => setResult({ ...result, actionItems })}
                />
              </SectionCard>

              <SectionCard title="Decisions Made" icon={<Gavel className="size-4" />}>
                <EditableList
                  editing={editing}
                  items={result.decisions}
                  onChange={(decisions) => setResult({ ...result, decisions })}
                />
              </SectionCard>

              <SectionCard title="Deadlines" icon={<CalendarClock className="size-4" />}>
                <EditableList
                  editing={editing}
                  items={result.deadlines}
                  marker="number"
                  onChange={(deadlines) => setResult({ ...result, deadlines })}
                />
              </SectionCard>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
