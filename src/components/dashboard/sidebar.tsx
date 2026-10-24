"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, NAV_ITEMS } from "./nav-items";

// Left sidebar, shown on desktop only.
export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-200 bg-white md:flex">
      <div className="px-5 py-5 text-lg font-semibold tracking-tight text-stone-900">
        Clinic CRM
      </div>
      <nav className="flex flex-col gap-1 px-3" aria-label="Main">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
