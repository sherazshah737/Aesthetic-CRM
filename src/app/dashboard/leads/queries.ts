import { createClient } from "@/lib/supabase/server";
import { endOfTodayPkt } from "@/lib/datetime";
import {
  isSource,
  isStatus,
  isUuid,
  type Lead,
  type LeadSource,
  type LeadStatus,
  type StaffMember,
} from "@/lib/leads";

export type LeadFilters = {
  q: string;
  status?: LeadStatus;
  source?: LeadSource;
  assigned?: string; // staff id, or "unassigned"
  sort: "newest" | "oldest" | "followup";
  view: "list" | "board";
};

type SearchParams = Record<string, string | string[] | undefined>;

// Turns the page URL into safe, checked filters.
export function parseFilters(sp: SearchParams): LeadFilters {
  const one = (key: string) => {
    const v = sp[key];
    return (Array.isArray(v) ? v[0] : v) ?? "";
  };
  const status = one("status");
  const source = one("source");
  const assigned = one("assigned");
  const sort = one("sort");

  return {
    q: one("q").trim().slice(0, 60),
    status: isStatus(status) ? status : undefined,
    source: isSource(source) ? source : undefined,
    assigned:
      assigned === "unassigned" || isUuid(assigned) ? assigned : undefined,
    sort: sort === "oldest" || sort === "followup" ? sort : "newest",
    view: one("view") === "board" ? "board" : "list",
  };
}

const LEAD_COLUMNS =
  "id, full_name, phone, source, service, status, next_followup_at, assigned_to, created_at";

export async function getStaff(): Promise<StaffMember[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .order("full_name");
  return data ?? [];
}

export async function getLeads(filters: LeadFilters, limit = 200) {
  const supabase = await createClient();
  let query = supabase.from("leads").select(LEAD_COLUMNS).limit(limit);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.assigned === "unassigned") query = query.is("assigned_to", null);
  else if (filters.assigned) query = query.eq("assigned_to", filters.assigned);

  if (filters.q) {
    // Remove characters that have a special meaning in the filter syntax.
    const text = filters.q.replace(/[%,()*\\]/g, " ").trim();
    const digits = filters.q.replace(/\D/g, "").replace(/^(0092|92|0)/, "");
    const parts = [`full_name.ilike.%${text}%`];
    if (digits.length >= 3) parts.push(`phone.ilike.%${digits}%`);
    query = query.or(parts.join(","));
  }

  if (filters.sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (filters.sort === "followup") {
    query = query.order("next_followup_at", { ascending: true, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw new Error("Could not load leads");
  return (data ?? []) as Lead[];
}

// Leads that need a call today, or are already overdue.
export async function getFollowups() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .not("next_followup_at", "is", null)
    .lte("next_followup_at", endOfTodayPkt())
    .not("status", "in", "(converted,lost)")
    .order("next_followup_at", { ascending: true })
    .limit(50);
  if (error) throw new Error("Could not load follow-ups");
  const now = Date.now();
  return ((data ?? []) as Lead[]).map((lead) => ({
    ...lead,
    overdue: new Date(lead.next_followup_at!).getTime() < now,
  }));
}
