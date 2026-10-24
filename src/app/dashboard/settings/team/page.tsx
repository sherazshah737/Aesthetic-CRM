import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { AddStaffForm } from "./add-staff-form";

export const metadata = { title: "Team | Clinic CRM" };

type Member = { id: string; full_name: string; email: string; role: Role };

export default async function TeamPage() {
  const session = await getCurrentUser();
  if (!session?.profile) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .order("created_at");
  const members: Member[] = data ?? [];
  const isOwner = session.profile.role === "owner";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-stone-900">Team</h1>

      <section className="rounded-2xl border border-stone-200 bg-white">
        <h2 className="border-b border-stone-100 px-4 py-3 text-sm font-medium text-stone-700">
          Staff ({members.length})
        </h2>
        <ul className="divide-y divide-stone-100">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-stone-900">{m.full_name}</p>
                <p className="truncate text-xs text-stone-500">{m.email}</p>
              </div>
              <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                {ROLE_LABELS[m.role]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {isOwner && (
        <section className="max-w-md rounded-2xl border border-stone-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-stone-700">Add staff</h2>
          <AddStaffForm />
        </section>
      )}
    </div>
  );
}
