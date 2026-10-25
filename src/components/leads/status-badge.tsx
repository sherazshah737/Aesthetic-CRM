import { STATUS_LABELS, type LeadStatus } from "@/lib/leads";

const STYLES: Record<LeadStatus, string> = {
  new: "bg-sky-50 text-sky-700",
  contacted: "bg-amber-50 text-amber-700",
  booked: "bg-violet-50 text-violet-700",
  converted: "bg-emerald-50 text-emerald-700",
  lost: "bg-stone-100 text-stone-500",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
