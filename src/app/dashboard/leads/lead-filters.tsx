"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { inputClass } from "@/components/ui/field";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  SOURCE_LABELS,
  STATUS_LABELS,
  type StaffMember,
} from "@/lib/leads";
import type { LeadFilters } from "./queries";

// Search + filters. Changing a dropdown updates the list straight away.
export function LeadFiltersBar({
  filters,
  staff,
}: {
  filters: LeadFilters;
  staff: StaffMember[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function apply() {
    const form = formRef.current;
    if (!form) return;
    const params = new URLSearchParams();
    new FormData(form).forEach((value, key) => {
      if (typeof value === "string" && value) params.set(key, value);
    });
    router.replace(`/dashboard/leads?${params.toString()}`);
  }

  function clear() {
    const form = formRef.current;
    if (!form) return;
    for (const name of ["q", "status", "source", "assigned"]) {
      const field = form.elements.namedItem(name) as
        | HTMLInputElement
        | HTMLSelectElement
        | null;
      if (field) field.value = "";
    }
    apply();
  }

  const hasFilters = Boolean(
    filters.q || filters.status || filters.source || filters.assigned,
  );

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      onChange={(e) => {
        clearTimeout(timer.current);
        const isText = (e.target as HTMLElement).tagName === "INPUT";
        timer.current = setTimeout(apply, isText ? 400 : 0);
      }}
      className="grid grid-cols-2 gap-2 md:grid-cols-6"
    >
      <input type="hidden" name="view" value={filters.view} />
      <input
        name="q"
        type="search"
        defaultValue={filters.q}
        placeholder="Search name or phone"
        aria-label="Search leads"
        className={`${inputClass} col-span-2 md:col-span-2`}
      />
      <select name="status" defaultValue={filters.status ?? ""} aria-label="Status" className={inputClass}>
        <option value="">All statuses</option>
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      <select name="source" defaultValue={filters.source ?? ""} aria-label="Source" className={inputClass}>
        <option value="">All sources</option>
        {LEAD_SOURCES.map((s) => (
          <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
        ))}
      </select>
      <select name="assigned" defaultValue={filters.assigned ?? ""} aria-label="Assigned staff" className={inputClass}>
        <option value="">All staff</option>
        <option value="unassigned">Unassigned</option>
        {staff.map((s) => (
          <option key={s.id} value={s.id}>{s.full_name}</option>
        ))}
      </select>
      <select name="sort" defaultValue={filters.sort} aria-label="Sort" className={inputClass}>
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="followup">Next follow-up</option>
      </select>
      {hasFilters && (
        <button
          type="button"
          onClick={clear}
          className="col-span-2 text-center text-xs text-brand-600 hover:underline md:col-span-6 md:text-left"
        >
          Clear filters
        </button>
      )}
    </form>
  );
}
