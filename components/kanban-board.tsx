"use client";

import { useOptimistic, useState, useTransition, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

export type KanbanItem = { id: string; stage_id: string; position: number };
export type KanbanStage = { id: string; label: string; color: string };

function computePosition(list: KanbanItem[], index: number): number {
  const prev = list[index - 1];
  const next = list[index];
  if (!prev && !next) return Date.now();
  if (!prev) return next.position - 1000;
  if (!next) return prev.position + 1000;
  return (prev.position + next.position) / 2;
}

function SortableCard({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(isDragging && "opacity-40")}
    >
      {children}
    </div>
  );
}

function Column({ stageId, children }: { stageId: string; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[120px] flex-1 flex-col gap-2 rounded-xl p-2 transition-colors",
        isOver ? "bg-brand-primary/5" : "bg-line/25"
      )}
    >
      {children}
    </div>
  );
}

export function KanbanBoard<T extends KanbanItem>({
  stages,
  items,
  onMove,
  renderCard,
  columnFooter,
  emptyMessage,
}: {
  stages: KanbanStage[];
  items: T[];
  onMove: (id: string, stageId: string, position: number) => Promise<void>;
  renderCard: (item: T) => ReactNode;
  columnFooter?: (stageId: string) => ReactNode;
  emptyMessage: string;
}) {
  const [, startTransition] = useTransition();
  const [local, applyMove] = useOptimistic(
    items,
    (state: T[], moved: { id: string; stageId: string; position: number }) =>
      state.map((item) =>
        item.id === moved.id ? { ...item, stage_id: moved.stageId, position: moved.position } : item
      )
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function columnItems(stageId: string) {
    return local.filter((item) => item.stage_id === stageId).sort((a, b) => a.position - b.position);
  }

  function stageIdOf(id: string): string | null {
    if (stages.some((s) => s.id === id)) return id;
    return local.find((i) => i.id === id)?.stage_id ?? null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeItemId = String(active.id);
    const overId = String(over.id);
    const destStageId = stageIdOf(overId);
    const sourceItem = local.find((i) => i.id === activeItemId);
    if (!destStageId || !sourceItem) {
      setActiveId(null);
      return;
    }

    const destList = columnItems(destStageId).filter((i) => i.id !== activeItemId);
    let index = destList.length;
    const overIndex = destList.findIndex((i) => i.id === overId);
    if (overIndex !== -1) index = overIndex;

    if (sourceItem.stage_id === destStageId) {
      const currentIndex = columnItems(destStageId).findIndex((i) => i.id === activeItemId);
      if (currentIndex === index) {
        setActiveId(null);
        return;
      }
    }

    const newPosition = computePosition(destList, index);

    startTransition(async () => {
      applyMove({ id: activeItemId, stageId: destStageId, position: newPosition });
      setActiveId(null);
      await onMove(activeItemId, destStageId, newPosition);
    });
  }

  const activeItem = activeId ? local.find((i) => i.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        {stages.map((stage) => {
          const stageItems = columnItems(stage.id);
          return (
            <div key={stage.id} className="flex w-72 shrink-0 flex-col">
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
                <h3 className="font-display text-sm font-semibold text-ink">{stage.label}</h3>
                <span className="text-xs text-inkmuted">{stageItems.length}</span>
              </div>

              <SortableContext items={stageItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <Column stageId={stage.id}>
                  {stageItems.length === 0 && (
                    <p className="px-2 py-6 text-center text-xs text-inkmuted">{emptyMessage}</p>
                  )}
                  {stageItems.map((item) => (
                    <SortableCard key={item.id} id={item.id}>
                      {renderCard(item)}
                    </SortableCard>
                  ))}
                </Column>
              </SortableContext>

              {columnFooter?.(stage.id)}
            </div>
          );
        })}
      </div>

      <DragOverlay>{activeItem ? <div className="rotate-1 shadow-lg">{renderCard(activeItem)}</div> : null}</DragOverlay>
    </DndContext>
  );
}
