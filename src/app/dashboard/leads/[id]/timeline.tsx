import { formatPkt } from "@/lib/datetime";
import { STATUS_LABELS, type LeadStatus, type StaffMember } from "@/lib/leads";

export type Activity = {
  id: string;
  type: "created" | "status_change" | "note" | "followup" | "assigned" | "edited";
  body: string | null;
  meta: { from?: string | null; to?: string | null } | null;
  created_by: string | null;
  created_at: string;
};

function describe(a: Activity, staffName: Map<string, string>): string {
  switch (a.type) {
    case "created":
      return "Lead created";
    case "status_change":
      return a.meta?.to === "converted"
        ? "Converted to patient"
        : `Status changed to ${STATUS_LABELS[a.meta?.to as LeadStatus] ?? a.meta?.to}`;
    case "assigned":
      return a.meta?.to
        ? `Assigned to ${staffName.get(a.meta.to) ?? "a staff member"}`
        : "Unassigned";
    case "followup":
      return a.meta?.to
        ? `Follow-up set for ${formatPkt(a.meta.to)}`
        : "Follow-up cleared";
    case "edited":
      return "Details updated";
    case "note":
      return "Note";
  }
}

export function Timeline({
  activities,
  staff,
}: {
  activities: Activity[];
  staff: StaffMember[];
}) {
  const staffName = new Map(staff.map((s) => [s.id, s.full_name]));

  return (
    <ol className="space-y-4">
      {activities.map((a) => (
        <li key={a.id} className="relative border-l-2 border-brand-100 pl-4">
          <span className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-brand-500" aria-hidden />
          <p className="text-sm font-medium text-stone-800">{describe(a, staffName)}</p>
          {a.type === "note" && a.body && (
            <p className="mt-1 whitespace-pre-wrap rounded-lg bg-stone-50 p-2 text-sm text-stone-700">
              {a.body}
            </p>
          )}
          <p className="mt-0.5 text-xs text-stone-500">
            {formatPkt(a.created_at)}
            {a.created_by && staffName.get(a.created_by) ? ` · ${staffName.get(a.created_by)}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}
