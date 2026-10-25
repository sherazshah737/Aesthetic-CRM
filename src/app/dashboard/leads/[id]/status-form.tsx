"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { inputClass } from "@/components/ui/field";
import {
  MANUAL_STATUSES,
  STATUS_LABELS,
  type LeadStatus,
} from "@/lib/leads";
import { changeLeadStatus } from "../actions";

export function StatusSelect({
  leadId,
  status,
}: {
  leadId: string;
  status: LeadStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onChange(next: string) {
    setBusy(true);
    const result = await changeLeadStatus(leadId, next);
    setBusy(false);
    if (result.error) toast.error(result.error);
    else toast.success("Status updated.");
    router.refresh();
  }

  if (status === "converted") {
    return <p className="text-sm text-emerald-700">Converted to patient</p>;
  }

  return (
    <select
      value={status}
      disabled={busy}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Change status"
      className={inputClass}
    >
      {MANUAL_STATUSES.map((s) => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}
