"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Field, inputClass } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { toPktInput } from "@/lib/datetime";
import {
  LEAD_SERVICES,
  LEAD_SOURCES,
  SERVICE_LABELS,
  SOURCE_LABELS,
  type Lead,
  type StaffMember,
} from "@/lib/leads";
import type { ActionState } from "@/lib/action-state";
import { checkPhone, type DuplicateMatches } from "./actions";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  staff: StaffMember[];
  lead?: Lead; // present when editing
  submitLabel: string;
};

// Used for both "Add lead" and "Edit lead".
export function LeadForm({ action, staff, lead, submitLabel }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, undefined);
  const [duplicates, setDuplicates] = useState<DuplicateMatches>();

  useEffect(() => {
    if (!state) return;
    if (state.error) toast.error(state.error);
    else if (state.message) {
      toast.success(state.message);
      if (state.id) router.push(`/dashboard/leads/${state.id}`);
    }
  }, [state, router]);

  async function onPhoneBlur(value: string) {
    if (!value.trim()) return setDuplicates(undefined);
    setDuplicates(await checkPhone(value, lead?.id));
  }

  const hasDuplicates =
    duplicates && (duplicates.leads.length > 0 || duplicates.patients.length > 0);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Name">
        <input name="full_name" defaultValue={lead?.full_name} required maxLength={100} className={inputClass} />
      </Field>

      <Field label="Phone" hint="e.g. 0300 1234567. Saved as +92 300 1234567.">
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={lead?.phone}
          required
          onBlur={(e) => onPhoneBlur(e.target.value)}
          className={inputClass}
        />
      </Field>

      {hasDuplicates && (
        <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-medium">This phone number already exists:</p>
          <ul className="mt-1 list-disc pl-5">
            {duplicates.leads.map((l) => (
              <li key={l.id}>
                Lead:{" "}
                <Link href={`/dashboard/leads/${l.id}`} className="underline" target="_blank">
                  {l.full_name}
                </Link>
              </li>
            ))}
            {duplicates.patients.map((p) => (
              <li key={p.id}>Patient: {p.full_name}</li>
            ))}
          </ul>
          <p className="mt-1 text-xs">You can still save if this is a different person.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Source">
          <select name="source" defaultValue={lead?.source ?? "facebook"} className={inputClass}>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
            ))}
          </select>
        </Field>
        <Field label="Interested in">
          <select name="service" defaultValue={lead?.service ?? "prp_face"} className={inputClass}>
            {LEAD_SERVICES.map((s) => (
              <option key={s} value={s}>{SERVICE_LABELS[s]}</option>
            ))}
          </select>
        </Field>
        <Field label="Assigned to">
          <select name="assigned_to" defaultValue={lead?.assigned_to ?? ""} className={inputClass}>
            <option value="">Unassigned</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </select>
        </Field>
        <Field label="Next follow-up" hint="Pakistan time">
          <input
            name="next_followup_at"
            type="datetime-local"
            defaultValue={toPktInput(lead?.next_followup_at ?? null)}
            className={inputClass}
          />
        </Field>
      </div>

      <SubmitButton pendingText="Saving...">{submitLabel}</SubmitButton>
    </form>
  );
}
