"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";
import { convertLead } from "../actions";

export function ConvertButton({
  leadId,
  name,
}: {
  leadId: string;
  name: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!window.confirm(`Convert ${name} to a patient?`)) return;
    setBusy(true);
    const result = await convertLead(leadId);
    setBusy(false);
    if (result.error) toast.error(result.error);
    else toast.success(`${name} is now a patient.`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
    >
      <UserCheck className="size-4" aria-hidden />
      {busy ? "Converting..." : "Convert to patient"}
    </button>
  );
}
