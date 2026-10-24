"use client";

import { useActionState, useEffect, useRef } from "react";
import { addStaff } from "./actions";
import { Field, inputClass } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { ROLE_LABELS, STAFF_ROLES } from "@/lib/roles";

export function AddStaffForm() {
  const [state, action] = useActionState(addStaff, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.tempPassword) formRef.current?.reset();
  }, [state]);

  return (
    <div className="space-y-4">
      <form ref={formRef} action={action} className="space-y-4">
        <Field label="Name">
          <input name="full_name" required className={inputClass} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field label="Role">
          <select name="role" required defaultValue="receptionist" className={inputClass}>
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </Field>
        <FormAlert error={state?.error} />
        <SubmitButton pendingText="Adding...">Add staff member</SubmitButton>
      </form>

      {state?.tempPassword && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-medium">{state.message}</p>
          <p className="mt-1">
            Give them these login details. The password is shown only once.
          </p>
          <p className="mt-2 break-all font-mono text-xs">
            Email: {state.email}
            <br />
            Password: {state.tempPassword}
          </p>
        </div>
      )}
    </div>
  );
}
