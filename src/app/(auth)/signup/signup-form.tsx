"use client";

import { useActionState } from "react";
import { signup } from "../actions";
import { Field, inputClass } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";

export function SignupForm() {
  const [state, action] = useActionState(signup, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Email">
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field label="Password" hint="At least 8 characters.">
        <input name="password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
      </Field>
      <FormAlert error={state?.error} message={state?.message} />
      <SubmitButton pendingText="Creating account...">Create account</SubmitButton>
    </form>
  );
}
