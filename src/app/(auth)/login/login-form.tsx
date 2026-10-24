"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { Field, inputClass } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm() {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Email">
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <FormAlert error={state?.error} />
      <SubmitButton pendingText="Logging in...">Log in</SubmitButton>
    </form>
  );
}
