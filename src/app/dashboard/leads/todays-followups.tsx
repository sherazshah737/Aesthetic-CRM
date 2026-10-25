import Link from "next/link";
import { BellRing } from "lucide-react";
import { WhatsAppButton } from "@/components/leads/whatsapp-button";
import { formatPkt } from "@/lib/datetime";
import { SERVICE_LABELS } from "@/lib/leads";
import { getFollowups } from "./queries";

// Leads to call today, plus any that are overdue.
export async function TodaysFollowups() {
  const leads = await getFollowups();

  return (
    <section className="rounded-2xl border border-stone-200 bg-white">
      <h2 className="flex items-center gap-2 border-b border-stone-100 px-4 py-3 text-sm font-medium text-stone-700">
        <BellRing className="size-4 text-brand-600" aria-hidden />
        Today&apos;s follow-ups ({leads.length})
      </h2>
      {leads.length === 0 ? (
        <p className="px-4 py-4 text-sm text-stone-500">Nothing due today. 🎉</p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {leads.map((lead) => {
            const overdue = lead.overdue;
            return (
              <li key={lead.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="block truncate text-sm font-medium text-stone-900 hover:underline"
                  >
                    {lead.full_name}
                  </Link>
                  <p className="truncate text-xs text-stone-500">
                    {SERVICE_LABELS[lead.service]} ·{" "}
                    <span className={overdue ? "font-medium text-red-600" : ""}>
                      {overdue ? "Overdue · " : ""}
                      {formatPkt(lead.next_followup_at)}
                    </span>
                  </p>
                </div>
                <WhatsAppButton phone={lead.phone} label="Chat" />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
