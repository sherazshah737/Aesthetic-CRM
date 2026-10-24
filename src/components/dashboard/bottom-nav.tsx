"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, NAV_ITEMS } from "./nav-items";

// Bottom bar, shown on phones only.
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-7 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV_ITEMS.map(({ href, short, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
              active ? "text-brand-700" : "text-stone-500"
            }`}
          >
            <Icon className="size-5" aria-hidden />
            {short}
          </Link>
        );
      })}
    </nav>
  );
}
