"use client";

import { useActionState } from "react";
import { createClinic } from "./actions";
import { Field, inputClass } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";

export function OnboardingForm() {
  const [state, action] = useActionState(createClinic, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Your name">
        <input name="full_name" autoComplete="name" required className={inputClass} />
      </Field>
      <Field label="Clinic name">
        <input name="clinic_name" required className={inputClass} />
      </Field>
      <Field label="City">
        <input name="city" placeholder="Lahore" required className={inputClass} />
      </Field>
      <Field label="Clinic phone" hint="e.g. 0300 1234567">
        <input name="phone" type="tel" inputMode="tel" autoComplete="tel" required className={inputClass} />
      </Field>
      <FormAlert error={state?.error} />
      <SubmitButton pendingText="Setting up...">Create my clinic</SubmitButton>
    </form>
  );
}
