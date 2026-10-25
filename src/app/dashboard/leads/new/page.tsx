import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createLead } from "../actions";
import { LeadForm } from "../lead-form";
import { getStaff } from "../queries";

export const metadata = { title: "Add lead | Clinic CRM" };

export default function NewLeadPage() {
  return (
    <div className="max-w-xl space-y-4">
      <Link href="/dashboard/leads" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700">
        <ArrowLeft className="size-4" aria-hidden /> Back to leads
      </Link>
      <h1 className="text-xl font-semibold text-stone-900">Add lead</h1>
      <div className="rounded-2xl border border-stone-200 bg-white p-4 md:p-6">
        <Suspense fallback={<div className="h-80 animate-pulse rounded bg-stone-100" aria-busy="true" />}>
          <NewLeadForm />
        </Suspense>
      </div>
    </div>
  );
}

async function NewLeadForm() {
  const staff = await getStaff();
  return <LeadForm action={createLead} staff={staff} submitLabel="Add lead" />;
}
