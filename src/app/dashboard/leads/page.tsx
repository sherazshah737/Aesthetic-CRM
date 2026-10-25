import { Suspense } from "react";
import Link from "next/link";
import { LayoutGrid, List, Plus } from "lucide-react";
import { LeadBoard } from "./lead-board";
import { LeadFiltersBar } from "./lead-filters";
import { LeadList } from "./lead-list";
import { getLeads, getStaff, parseFilters } from "./queries";
import { TodaysFollowups } from "./todays-followups";

export const metadata = { title: "Leads | Clinic CRM" };

export default function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<LeadsSkeleton />}>
      <LeadsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LeadsContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const [leads, staff] = await Promise.all([getLeads(filters), getStaff()]);

  const viewLink = (view: "list" | "board") => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.status) params.set("status", filters.status);
    if (filters.source) params.set("source", filters.source);
    if (filters.assigned) params.set("assigned", filters.assigned);
    if (filters.sort !== "newest") params.set("sort", filters.sort);
    params.set("view", view);
    return `/dashboard/leads?${params.toString()}`;
  };
  const tab = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
      active ? "bg-brand-50 text-brand-700" : "text-stone-500 hover:bg-stone-100"
    }`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-stone-900">Leads</h1>
        <Link
          href="/dashboard/leads/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="size-4" aria-hidden />
          Add lead
        </Link>
      </div>

      <TodaysFollowups />

      <LeadFiltersBar filters={filters} staff={staff} />

      <div className="flex gap-1">
        <Link href={viewLink("list")} className={tab(filters.view === "list")}>
          <List className="size-4" aria-hidden /> List
        </Link>
        <Link href={viewLink("board")} className={tab(filters.view === "board")}>
          <LayoutGrid className="size-4" aria-hidden /> Board
        </Link>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
          {filters.q || filters.status || filters.source || filters.assigned
            ? "No leads match these filters."
            : "No leads yet. Add your first lead to get started."}
        </div>
      ) : filters.view === "board" ? (
        <LeadBoard leads={leads} />
      ) : (
        <LeadList leads={leads} staff={staff} />
      )}
    </div>
  );
}

function LeadsSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true">
      <div className="h-8 w-40 rounded bg-stone-200" />
      <div className="h-24 rounded-2xl bg-stone-200" />
      <div className="h-64 rounded-2xl bg-stone-200" />
    </div>
  );
}
