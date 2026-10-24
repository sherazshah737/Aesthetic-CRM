import Link from "next/link";
import { Users } from "lucide-react";

export const metadata = { title: "Settings | Clinic CRM" };

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900">Settings</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link
          href="/dashboard/settings/team"
          className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 hover:border-brand-200"
        >
          <Users className="size-5 text-brand-600" aria-hidden />
          <span>
            <span className="block text-sm font-medium text-stone-900">Team</span>
            <span className="block text-xs text-stone-500">Add and view staff</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
