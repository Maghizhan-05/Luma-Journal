"use client";

import { type ReactNode, useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GlassCard } from "@/components/ui/GlassCard";

export interface BoardItem {
  id: string;
  accent: React.ComponentProps<typeof GlassCard>["accent"];
  wide?: boolean;
  content: ReactNode;
}

const STORAGE_KEY = "luma:today-order";

function SortableCard({ item }: { item: BoardItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 30 : undefined,
      }}
      className={`${item.wide ? "md:col-span-2" : ""} ${isDragging ? "opacity-80" : ""}`}
    >
      <GlassCard accent={item.accent} padding={item.wide ? "lg" : "md"} className="relative">
        {/* Drag handle — only this starts a drag, so card inputs stay usable */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to rearrange"
          className="absolute right-3 top-3 z-10 cursor-grab touch-none rounded-md px-1.5 py-0.5 text-[color:var(--muted-2)] transition hover:text-[color:var(--ink-soft)] active:cursor-grabbing"
        >
          ⠿
        </button>
        {item.content}
      </GlassCard>
    </div>
  );
}

export function DayBoard({ items }: { items: BoardItem[] }) {
  const defaultOrder = items.map((i) => i.id);
  const [order, setOrder] = useState<string[]>(defaultOrder);

  // Load a saved arrangement after mount (keeps SSR markup stable).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const ids: string[] = JSON.parse(saved);
      const merged = [
        ...ids.filter((id) => defaultOrder.includes(id)),
        ...defaultOrder.filter((id) => !ids.includes(id)),
      ];
      // Defer so we don't setState synchronously during the mount effect
      // (initial render stays identical to the server markup).
      queueMicrotask(() => setOrder(merged));
    } catch {
      /* ignore malformed/absent storage */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const next = arrayMove(prev, prev.indexOf(String(active.id)), prev.indexOf(String(over.id)));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const ordered = order
    .map((id) => items.find((i) => i.id === id))
    .filter((x): x is BoardItem => Boolean(x));

  return (
    <DndContext id="luma-day-board" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          {ordered.map((item) => (
            <SortableCard key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
