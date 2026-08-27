/**
 * Simulated AI layer for the prototype.
 *
 * Each tool has a structured "prompt template" that documents how a real model
 * would be asked to respond, plus a deterministic demo generator that produces
 * professional, organised sample output from the user's input.
 */

export const PROMPT_TEMPLATES = {
  meetingNotes: `You are a workplace productivity assistant. Summarise the meeting notes below.
Return: 1) Meeting Summary (3-4 sentences) 2) Key Points 3) Action Items with owners
4) Decisions Made 5) Deadlines. Be concise, neutral and professional.`,
  taskPlanner: `You are an execution planner. Turn the goal or task list below into a
sequenced plan. For each task return: name, description, priority (High/Medium/Low),
suggested deadline, status and the single next step. Keep tasks outcome-oriented.`,
  research: `You are a research assistant. For the topic below return: Overview,
Key Findings, Important Points, Suggested Topics or Sources to Explore, and
Follow-up Questions. Flag uncertainty and avoid inventing statistics.`,
} as const;

export const AI_DISCLAIMER =
  "AI-generated content may contain errors or omissions. Always review and verify important information before using it for professional decisions.";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function lines(input: string): string[] {
  return input
    .split(/\n|(?<=\.)\s+/)
    .map((l) => l.replace(/^[-•*\d.\s]+/, "").trim())
    .filter((l) => l.length > 3);
}

function topicOf(input: string): string {
  const first = lines(input)[0] ?? "the requested topic";
  return first.length > 70 ? first.slice(0, 70) + "…" : first;
}

function futureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export type MeetingResult = {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  decisions: string[];
  deadlines: string[];
};

export async function summariseMeeting(notes: string, variant = 0): Promise<MeetingResult> {
  await delay(900);
  const l = lines(notes);
  const subject = topicOf(notes);
  const pick = (i: number, fallback: string) => l[i] ?? fallback;

  return {
    summary:
      variant % 2 === 0
        ? `The team met to review ${subject.toLowerCase()}. Progress since the last session was shared, blockers were raised and owners were confirmed for the next cycle. The group aligned on priorities and agreed to review outcomes at the next check-in.`
        : `This session focused on ${subject.toLowerCase()}. Participants worked through open items, clarified responsibilities and agreed a short list of priorities. Remaining risks were noted and will be tracked until the follow-up meeting.`,
    keyPoints: [
      pick(0, "Current status was reviewed against the agreed plan."),
      pick(1, "Two blockers were raised that need cross-team support."),
      pick(2, "Scope for the next iteration was confirmed with the team."),
      "Stakeholder communication will continue on a weekly cadence.",
    ],
    actionItems: [
      `Owner: Project lead — Circulate the written recap of ${subject.toLowerCase()} (due ${futureDate(1)}).`,
      `Owner: ${pick(3, "Delivery team")} — Unblock the outstanding dependency and confirm in the channel.`,
      "Owner: Analyst — Prepare a short metrics update for the next meeting.",
    ],
    decisions: [
      "Proceed with the current approach; no change of direction required.",
      "Weekly check-ins remain 30 minutes with a written recap afterwards.",
      pick(4, "Lower-priority requests are deferred to the following cycle."),
    ],
    deadlines: [
      `Written recap shared — ${futureDate(1)}`,
      `Blocker resolved and confirmed — ${futureDate(4)}`,
      `Next review meeting — ${futureDate(7)}`,
    ],
  };
}

export type PlannedTask = {
  id: string;
  name: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  status: "Not started" | "In progress" | "Blocked" | "Done";
  nextStep: string;
};

export async function planTasks(goal: string, variant = 0): Promise<PlannedTask[]> {
  await delay(900);
  const items = lines(goal);
  const subject = topicOf(goal);
  const base: Array<Omit<PlannedTask, "id">> = [
    {
      name: `Clarify scope for ${subject}`,
      description:
        "Write a one-page definition of the outcome, success measures and what is explicitly out of scope.",
      priority: "High",
      deadline: futureDate(2),
      status: "Not started",
      nextStep: "Draft the scope note and share it for comment.",
    },
    {
      name: "Map dependencies and owners",
      description:
        "List every person, team or system the work depends on and confirm a named owner for each.",
      priority: "High",
      deadline: futureDate(4),
      status: "Not started",
      nextStep: "Book a 20-minute alignment call with each dependency owner.",
    },
    {
      name: "Build the first working version",
      description:
        "Deliver the smallest useful slice end to end so feedback can start before full completion.",
      priority: "Medium",
      deadline: futureDate(9),
      status: "Not started",
      nextStep: "Break the slice into two-day chunks and start the first one.",
    },
    {
      name: "Review, test and refine",
      description: "Run a structured review with stakeholders and fix the issues that block sign-off.",
      priority: "Medium",
      deadline: futureDate(14),
      status: "Not started",
      nextStep: "Schedule the review session and prepare a checklist.",
    },
    {
      name: "Roll out and communicate",
      description: "Ship the work, document how it is used and share the outcome with stakeholders.",
      priority: "Low",
      deadline: futureDate(18),
      status: "Not started",
      nextStep: "Draft the announcement and rollout checklist.",
    },
  ];

  const fromInput: Array<Omit<PlannedTask, "id">> = items.slice(0, 4).map((item, i) => ({
    name: item.length > 60 ? item.slice(0, 60) + "…" : item,
    description: `Deliver "${item}" to an agreed standard, with a clear owner and a checkable definition of done.`,
    priority: i === 0 ? "High" : i < 3 ? "Medium" : "Low",
    deadline: futureDate(3 + i * 4 + variant),
    status: i === 0 ? "In progress" : "Not started",
    nextStep: i === 0 ? "Confirm the owner and start today." : "Add to the backlog and sequence it.",
  }));

  const tasks = (items.length > 1 ? [...fromInput, ...base.slice(3)] : base).slice(0, 6);
  return tasks.map((t, i) => ({ ...t, id: `${Date.now()}-${i}` }));
}

export type ResearchResult = {
  overview: string;
  findings: string[];
  importantPoints: string[];
  sources: string[];
  followUps: string[];
};

export async function research(topic: string, variant = 0): Promise<ResearchResult> {
  await delay(900);
  const subject = topicOf(topic);
  return {
    overview:
      variant % 2 === 0
        ? `${subject} is an active area with a mix of established practice and fast-moving change. This draft outlines the current landscape, what is generally agreed, where opinions differ, and which directions are worth exploring further before making a decision.`
        : `This draft gives a working view of ${subject.toLowerCase()}: the main drivers, the evidence that is reasonably settled, the open questions, and the reading that would most improve confidence in a decision.`,
    findings: [
      `Adoption of ${subject.toLowerCase()} is uneven — leading teams are further ahead than published averages suggest.`,
      "Most reported benefits come from process change around the tooling, not the tooling alone.",
      "Cost and change-management effort are consistently underestimated at the planning stage.",
      "Measurement remains the weakest link; few organisations track outcomes beyond activity metrics.",
    ],
    importantPoints: [
      "Start with a narrow, measurable use case rather than a broad rollout.",
      "Agree success metrics before implementation so results can be compared honestly.",
      "Plan for governance, review and escalation paths from day one.",
      "Expect a learning curve of several weeks before productivity gains appear.",
    ],
    sources: [
      "Industry analyst reports (Gartner, Forrester, McKinsey) for market framing",
      "Peer-reviewed literature for evidence quality and methodology",
      "Vendor documentation and independent benchmarks for capability comparison",
      "Practitioner case studies and post-implementation reviews",
    ],
    followUps: [
      `What specific outcome should ${subject.toLowerCase()} improve, and by how much?`,
      "Which constraints — budget, skills, compliance — are non-negotiable?",
      "What does a credible pilot look like, and who would run it?",
      "What evidence would change the current recommendation?",
    ],
  };
}
