"use client";

import { useOptimistic, useState, useTransition } from "react";
import { addMoment, deleteMoment } from "@/lib/actions/day";
import { TAGS, TAG_MAP, type TagKey } from "@/lib/constants";
import type { KeyMoment } from "@/lib/types";

type Optimistic = { kind: "add"; m: KeyMoment } | { kind: "delete"; id: string };

export function KeyMomentsCard({ date, moments }: { date: string; moments: KeyMoment[] }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState<TagKey[]>([]);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const [items, applyOptimistic] = useOptimistic<KeyMoment[], Optimistic>(
    moments,
    (state, a) =>
      a.kind === "add" ? [a.m, ...state] : state.filter((m) => m.id !== a.id),
  );

  function toggleTag(k: TagKey) {
    setTags((prev) =>
      prev.includes(k) ? prev.filter((t) => t !== k) : prev.length < 6 ? [...prev, k] : prev,
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    const optimistic: KeyMoment = {
      id: `tmp-${Math.random()}`,
      user_id: "",
      entry_date: date,
      title: clean,
      description: desc.trim() || null,
      tags,
      created_at: new Date().toISOString(),
    };
    setTitle("");
    setDesc("");
    setTags([]);
    setOpen(false);
    startTransition(async () => {
      applyOptimistic({ kind: "add", m: optimistic });
      await addMoment({ date, title: clean, description: optimistic.description || undefined, tags });
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="type-heading" style={{ color: "var(--peach)" }}>⭐ Key Moments</h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-xs font-bold"
          style={{ color: "var(--peach)" }}
        >
          {open ? "cancel" : "+ add"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-4 flex flex-col gap-2.5 rounded-[var(--r-md)] p-3" style={{ boxShadow: "var(--clay-inset)", background: "var(--bg-2)" }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What happened?"
            autoFocus
            className="field py-2 text-sm"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="A little more (optional)…"
            rows={2}
            className="field resize-y py-2 text-sm"
          />
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map((t) => {
              const on = tags.includes(t.key);
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => toggleTag(t.key)}
                  className="chip text-xs"
                  style={on ? { color: t.color, boxShadow: `var(--clay-inset), 0 0 0 1.5px ${t.color}` } : { opacity: 0.6 }}
                >
                  {t.emoji} {t.label}
                </button>
              );
            })}
          </div>
          <button type="submit" className="self-start rounded-[var(--r-pill)] px-4 py-1.5 text-sm font-bold" style={{ background: "var(--accent)", color: "#17130a" }}>
            Save moment
          </button>
        </form>
      )}

      <ul className="flex flex-col gap-2.5">
        {items.map((m) => (
          <li key={m.id} className="group rounded-[var(--r-md)] p-3" style={{ boxShadow: "var(--clay-inset)", background: "var(--surface)" }}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-[color:var(--ink)]">{m.title}</p>
              <button
                type="button"
                onClick={() => startTransition(async () => { applyOptimistic({ kind: "delete", id: m.id }); await deleteMoment(m.id); })}
                aria-label="Delete moment"
                className="shrink-0 text-[color:var(--muted-2)] opacity-0 transition hover:text-[color:var(--coral)] group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
            {m.description && <p className="mt-0.5 text-sm text-[color:var(--muted)]">{m.description}</p>}
            {m.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {m.tags.map((k) => {
                  const t = TAG_MAP[k as TagKey];
                  if (!t) return null;
                  return (
                    <span key={k} className="chip text-xs" style={{ color: t.color }}>
                      {t.emoji} {t.label}
                    </span>
                  );
                })}
              </div>
            )}
          </li>
        ))}
        {items.length === 0 && !open && (
          <li className="text-sm text-[color:var(--muted-2)]">No moments yet — tap “+ add”.</li>
        )}
      </ul>
    </div>
  );
}
