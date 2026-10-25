import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/leads/status-badge";
import { WhatsAppButton } from "@/components/leads/whatsapp-button";
import { createClient } from "@/lib/supabase/server";
import { isUuid, type Lead } from "@/lib/leads";
import { addNote, updateLead } from "../actions";
import { LeadForm } from "../lead-form";
import { getStaff } from "../queries";
import { ConvertButton } from "./convert-button";
import { NoteForm } from "./note-form";
import { StatusSelect } from "./status-form";
import { Timeline, type Activity } from "./timeline";

export const metadata = { title: "Lead | Clinic CRM" };

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="space-y-4">
      <Link href="/dashboard/leads" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700">
        <ArrowLeft className="size-4" aria-hidden /> Back to leads
      </Link>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-stone-200" aria-busy="true" />}>
        <LeadDetail params={params} />
      </Suspense>
    </div>
  );
}

async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const [leadRes, activitiesRes, staff] = await Promise.all([
    supabase
      .from("leads")
      .select("id, full_name, phone, source, service, status, next_followup_at, assigned_to, created_at")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("lead_activities")
      .select("id, type, body, meta, created_by, created_at")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    getStaff(),
  ]);

  const lead = leadRes.data as Lead | null;
  if (!lead) notFound();
  const activities = (activitiesRes.data ?? []) as Activity[];

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-stone-900">{lead.full_name}</h1>
            <StatusBadge status={lead.status} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <WhatsAppButton phone={lead.phone} />
            {lead.status !== "converted" && (
              <ConvertButton leadId={lead.id} name={lead.full_name} />
            )}
          </div>
        </div>

        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-medium text-stone-700">Status</h2>
          <StatusSelect leadId={lead.id} status={lead.status} />
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-4 md:p-6">
          <h2 className="mb-4 text-sm font-medium text-stone-700">Details</h2>
          <LeadForm
            action={updateLead.bind(null, lead.id)}
            staff={staff}
            lead={lead}
            submitLabel="Save changes"
          />
        </section>
      </div>

      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-stone-700">Add a note</h2>
          <NoteForm action={addNote.bind(null, lead.id)} />
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <h2 className="mb-4 text-sm font-medium text-stone-700">Activity</h2>
          <Timeline activities={activities} staff={staff} />
        </section>
      </div>
    </div>
  );
}
