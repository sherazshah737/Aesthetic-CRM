"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { formatPkt } from "@/lib/datetime";
import {
  LEAD_STATUSES,
  SERVICE_LABELS,
  STATUS_LABELS,
  type Lead,
  type LeadStatus,
} from "@/lib/leads";
import { changeLeadStatus, convertLead } from "./actions";

function CardBody({ lead }: { lead: Lead }) {
  return (
    <>
      <p className="truncate text-sm font-medium text-stone-900">{lead.full_name}</p>
      <p className="text-xs text-stone-500">{lead.phone}</p>
      <p className="mt-1 text-xs text-stone-500">{SERVICE_LABELS[lead.service]}</p>
      {lead.next_followup_at && (
        <p className="mt-1 text-xs text-brand-700">{formatPkt(lead.next_followup_at)}</p>
      )}
    </>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const locked = lead.status === "converted";
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    disabled: locked,
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`rounded-xl border border-stone-200 bg-white p-3 shadow-sm ${
        locked ? "" : "cursor-grab active:cursor-grabbing"
      } ${isDragging ? "opacity-40" : ""}`}
    >
      <Link href={`/dashboard/leads/${lead.id}`} className="block">
        <CardBody lead={lead} />
      </Link>
    </div>
  );
}

function Column({ status, leads }: { status: LeadStatus; leads: Lead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      className={`w-64 shrink-0 rounded-2xl border p-3 md:w-auto md:min-w-0 md:flex-1 ${
        isOver ? "border-brand-500 bg-brand-50" : "border-stone-200 bg-stone-100/60"
      }`}
    >
      <h3 className="mb-3 flex items-center justify-between text-sm font-medium text-stone-700">
        {STATUS_LABELS[status]}
        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-stone-500">
          {leads.length}
        </span>
      </h3>
      <div className="min-h-16 space-y-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </section>
  );
}

// Drag a card to another column to change its status.
export function LeadBoard({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  // Moves shown immediately, before the server confirms them.
  const [pending, setPending] = useState<Record<string, LeadStatus>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  );

  const items = leads.map((l) => ({ ...l, status: pending[l.id] ?? l.status }));
  const active = items.find((l) => l.id === activeId);

  function clearPending(id: string) {
    setPending((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const id = String(event.active.id);
    const target = event.over?.id as LeadStatus | undefined;
    const lead = items.find((l) => l.id === id);
    if (!lead || !target || target === lead.status) return;
    if (lead.status === "converted") return;

    if (target === "converted") {
      if (!window.confirm(`Convert ${lead.full_name} to a patient?`)) return;
      setPending((p) => ({ ...p, [id]: target }));
      const result = await convertLead(id);
      clearPending(id);
      if (result.error) toast.error(result.error);
      else toast.success(`${lead.full_name} is now a patient.`);
      router.refresh();
      return;
    }

    setPending((p) => ({ ...p, [id]: target }));
    const result = await changeLeadStatus(id, target);
    clearPending(id);
    if (result.error) toast.error(result.error);
    else toast.success(`Moved to ${STATUS_LABELS[target]}.`);
    router.refresh();
  }

  return (
    <DndContext
      id="lead-board"
      sensors={sensors}
      onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-3 overflow-x-auto pb-2">
        {LEAD_STATUSES.map((status) => (
          <Column key={status} status={status} leads={items.filter((l) => l.status === status)} />
        ))}
      </div>
      <DragOverlay>
        {active ? (
          <div className="rounded-xl border border-brand-500 bg-white p-3 shadow-lg">
            <CardBody lead={active} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
