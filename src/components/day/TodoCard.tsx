"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { addTodo, toggleTodo, deleteTodo } from "@/lib/actions/day";
import type { Todo } from "@/lib/types";

type Optimistic =
  | { kind: "add"; text: string }
  | { kind: "toggle"; id: string }
  | { kind: "delete"; id: string };

export function TodoCard({ date, todos }: { date: string; todos: Todo[] }) {
  const [text, setText] = useState("");
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const [items, applyOptimistic] = useOptimistic<Todo[], Optimistic>(
    todos,
    (state, action) => {
      if (action.kind === "add") {
        return [
          ...state,
          { id: `tmp-${Math.random()}`, text: action.text, is_done: false } as Todo,
        ];
      }
      if (action.kind === "toggle") {
        return state.map((t) => (t.id === action.id ? { ...t, is_done: !t.is_done } : t));
      }
      return state.filter((t) => t.id !== action.id);
    },
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    setText("");
    inputRef.current?.focus();
    startTransition(async () => {
      applyOptimistic({ kind: "add", text: clean });
      await addTodo(date, clean);
    });
  }

  const done = items.filter((t) => t.is_done).length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="type-heading" style={{ color: "var(--lilac)" }}>✅ To-Do</h2>
        {items.length > 0 && (
          <span className="text-xs text-[color:var(--muted-2)]">{done}/{items.length}</span>
        )}
      </div>

      <ul className="mb-3 flex flex-col gap-1.5">
        {items.map((t) => (
          <li key={t.id} className="group flex items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  applyOptimistic({ kind: "toggle", id: t.id });
                  await toggleTodo(t.id, !t.is_done);
                })
              }
              aria-label={t.is_done ? "Mark not done" : "Mark done"}
              className="grid h-5 w-5 shrink-0 place-items-center rounded-[6px] text-xs"
              style={{
                background: t.is_done ? "var(--mint)" : "var(--bg-2)",
                boxShadow: "var(--clay-inset)",
                color: "#14140f",
              }}
            >
              {t.is_done ? "✓" : ""}
            </button>
            <span
              className={`flex-1 text-sm ${t.is_done ? "text-[color:var(--muted-2)] line-through" : "text-[color:var(--ink-soft)]"}`}
            >
              {t.text}
            </span>
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  applyOptimistic({ kind: "delete", id: t.id });
                  await deleteTodo(t.id);
                })
              }
              aria-label="Delete todo"
              className="text-[color:var(--muted-2)] opacity-0 transition hover:text-[color:var(--coral)] group-hover:opacity-100"
            >
              ✕
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm text-[color:var(--muted-2)]">Nothing yet — add your first.</li>
        )}
      </ul>

      <form onSubmit={submit} className="flex gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task…"
          className="field flex-1 py-2 text-sm"
        />
        <button
          type="submit"
          className="shrink-0 rounded-[var(--r-md)] px-3 text-sm font-bold"
          style={{ background: "var(--accent)", color: "#17130a" }}
        >
          +
        </button>
      </form>
    </div>
  );
}
