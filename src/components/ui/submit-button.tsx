"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText = "Please wait...",
}: {
  children: React.ReactNode;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? pendingText : children}
    </button>
  );
}
