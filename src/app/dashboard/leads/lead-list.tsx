import Link from "next/link";
import { StatusBadge } from "@/components/leads/status-badge";
import { WhatsAppButton } from "@/components/leads/whatsapp-button";
import { formatPkt } from "@/lib/datetime";
import {
  SERVICE_LABELS,
  SOURCE_LABELS,
  type Lead,
  type StaffMember,
} from "@/lib/leads";

// Table on desktop, cards on phones.
export function LeadList({
  leads,
  staff,
}: {
  leads: Lead[];
  staff: StaffMember[];
}) {
  const staffName = new Map(staff.map((s) => [s.id, s.full_name]));
  const assignee = (lead: Lead) =>
    (lead.assigned_to && staffName.get(lead.assigned_to)) || "Unassigned";

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {leads.map((lead) => (
          <li key={lead.id} className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/dashboard/leads/${lead.id}`}
                className="min-w-0 truncate text-sm font-semibold text-stone-900"
              >
                {lead.full_name}
              </Link>
              <StatusBadge status={lead.status} />
            </div>
            <p className="mt-1 text-sm text-stone-600">{lead.phone}</p>
            <p className="mt-1 text-xs text-stone-500">
              {SERVICE_LABELS[lead.service]} · {SOURCE_LABELS[lead.source]} · {assignee(lead)}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs text-stone-500">
                {lead.next_followup_at
                  ? `Follow-up: ${formatPkt(lead.next_followup_at)}`
                  : "No follow-up set"}
              </span>
              <WhatsAppButton phone={lead.phone} />
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-2xl border border-stone-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-100 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              {["Name", "Phone", "Source", "Service", "Status", "Next follow-up", "Assigned", ""].map(
                (h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">
                  <Link href={`/dashboard/leads/${lead.id}`} className="hover:underline">
                    {lead.full_name}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-stone-600">{lead.phone}</td>
                <td className="px-4 py-3 text-stone-600">{SOURCE_LABELS[lead.source]}</td>
                <td className="px-4 py-3 text-stone-600">{SERVICE_LABELS[lead.service]}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-stone-600">
                  {lead.next_followup_at ? formatPkt(lead.next_followup_at) : "—"}
                </td>
                <td className="px-4 py-3 text-stone-600">{assignee(lead)}</td>
                <td className="px-4 py-3">
                  <WhatsAppButton phone={lead.phone} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
