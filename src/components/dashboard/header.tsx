import { LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import type { CurrentProfile } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/roles";

export function Header({ profile }: { profile: CurrentProfile }) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3 md:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-stone-900">
          {profile.clinic.name}
        </p>
        <p className="truncate text-xs text-stone-500">{profile.clinic.city}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="min-w-0 text-right">
          <p className="truncate text-sm font-medium text-stone-900">
            {profile.full_name}
          </p>
          <p className="text-xs text-stone-500">{ROLE_LABELS[profile.role]}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            aria-label="Log out"
            title="Log out"
            className="rounded-lg border border-stone-200 p-2 text-stone-600 hover:bg-stone-100"
          >
            <LogOut className="size-4" aria-hidden />
          </button>
        </form>
      </div>
    </header>
  );
}
