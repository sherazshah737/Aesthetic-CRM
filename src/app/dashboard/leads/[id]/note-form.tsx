"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { inputClass } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/lib/action-state";

export function NoteForm({
  action,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.error) toast.error(state.error);
    else if (state.message) {
      toast.success(state.message);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <textarea
        name="body"
        rows={3}
        required
        maxLength={2000}
        placeholder="Write a note, e.g. called, will decide by Friday"
        aria-label="Note"
        className={inputClass}
      />
      <SubmitButton pendingText="Saving...">Add note</SubmitButton>
    </form>
  );
}
