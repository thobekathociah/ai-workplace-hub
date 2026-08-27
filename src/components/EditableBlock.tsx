import { Check, Copy, Pencil } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow duration-300 hover:shadow-glow",
        className,
      )}
    >
      <div className="mb-3 flex min-w-0 items-center gap-2">
        {icon && <span className="grid size-8 shrink-0 place-items-center rounded-lg gradient-soft text-primary">{icon}</span>}
        <h2 className="truncate font-display text-sm font-extrabold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-lg"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : label}
    </Button>
  );
}

/** Editable paragraph block. */
export function EditableText({
  value,
  onChange,
  editing,
}: {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
}) {
  if (editing) {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-28 rounded-xl text-sm"
      />
    );
  }
  return <p className="text-sm leading-relaxed text-muted-foreground">{value}</p>;
}

/** Editable bullet list. */
export function EditableList({
  items,
  onChange,
  editing,
  marker = "dot",
}: {
  items: string[];
  onChange: (items: string[]) => void;
  editing: boolean;
  marker?: "dot" | "check" | "number";
}) {
  if (editing) {
    return (
      <Textarea
        value={items.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        className="min-h-32 rounded-xl text-sm"
      />
    );
  }
  return (
    <ul className="space-y-2">
      {items
        .filter((i) => i.trim())
        .map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
            <span
              className={cn(
                "mt-1.5 shrink-0 rounded-full",
                marker === "number" ? "mt-0 text-xs font-bold text-primary" : "size-1.5 gradient-brand",
              )}
            >
              {marker === "number" ? `${i + 1}.` : null}
            </span>
            <span className="min-w-0 text-muted-foreground">{item}</span>
          </li>
        ))}
    </ul>
  );
}

export function EditToggle({
  editing,
  setEditing,
}: {
  editing: boolean;
  setEditing: (v: boolean) => void;
}) {
  return (
    <Button
      variant={editing ? "default" : "outline"}
      size="sm"
      className="rounded-lg"
      onClick={() => setEditing(!editing)}
    >
      {editing ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
      {editing ? "Done" : "Edit"}
    </Button>
  );
}

export function DraftBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full gradient-soft px-3 py-1 text-[0.68rem] font-bold tracking-wide text-primary uppercase">
      AI-generated draft
    </span>
  );
}
