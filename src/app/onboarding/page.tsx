import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OnboardingForm } from "./onboarding-form";

export const metadata = { title: "Set up your clinic | Clinic CRM" };

export default function OnboardingPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-stone-900">Set up your clinic</h1>
        <p className="mb-4 mt-1 text-sm text-stone-500">
          Just a few details to get started. You will be the clinic owner.
        </p>
        <Suspense fallback={<div className="h-64" aria-busy="true" />}>
          <OnboardingGate />
        </Suspense>
      </div>
    </main>
  );
}

// Sends logged-out users to login, and finished users to the dashboard.
async function OnboardingGate() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");
  if (session.profile) redirect("/dashboard");
  return <OnboardingForm />;
}
