"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  isSupabaseConfigured,
  NOT_CONFIGURED_MESSAGE,
} from "@/lib/supabase/config";
import { normalizePkPhone } from "@/lib/phone";
import {
  isUuid,
  MANUAL_STATUSES,
  parseLeadForm,
  type LeadStatus,
} from "@/lib/leads";
import type { ActionState } from "@/lib/action-state";

// Every action starts here: are we configured, and who is signed in?
async function getContext() {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED_MESSAGE };
  const session = await getCurrentUser();
  if (!session?.profile) return { error: "Please log in again." };
  return { profile: session.profile, supabase: await createClient() };
}

function refreshLeadPages(id?: string) {
  revalidatePath("/dashboard/leads");
  if (id) revalidatePath(`/dashboard/leads/${id}`);
}

export async function createLead(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getContext();
  if ("error" in ctx) return { error: ctx.error };

  const parsed = parseLeadForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { data, error } = await ctx.supabase
    .from("leads")
    .insert({
      ...parsed.data,
      clinic_id: ctx.profile.clinic_id,
      created_by: ctx.profile.id,
    })
    .select("id")
    .single();
  if (error || !data) return { error: "Could not save the lead. Please try again." };

  refreshLeadPages();
  return { message: "Lead added.", id: data.id };
}

export async function updateLead(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getContext();
  if ("error" in ctx) return { error: ctx.error };
  if (!isUuid(id)) return { error: "Lead not found." };

  const parsed = parseLeadForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { data, error } = await ctx.supabase
    .from("leads")
    .update(parsed.data)
    .eq("id", id)
    .select("id");
  if (error) return { error: "Could not save changes. Please try again." };
  if (!data?.length) return { error: "Lead not found." };

  refreshLeadPages(id);
  return { message: "Changes saved." };
}

export async function changeLeadStatus(
  id: string,
  status: string,
): Promise<{ error?: string }> {
  const ctx = await getContext();
  if ("error" in ctx) return { error: ctx.error };
  if (!isUuid(id)) return { error: "Lead not found." };
  if (!(MANUAL_STATUSES as string[]).includes(status)) {
    return { error: "Invalid status." };
  }

  // Converted leads are final, so they are never changed here.
  const { data, error } = await ctx.supabase
    .from("leads")
    .update({ status: status as LeadStatus })
    .eq("id", id)
    .neq("status", "converted")
    .select("id");
  if (error) return { error: "Could not change the status." };
  if (!data?.length) return { error: "This lead can't be changed." };

  refreshLeadPages(id);
  return {};
}

export async function addNote(
  leadId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getContext();
  if ("error" in ctx) return { error: ctx.error };
  if (!isUuid(leadId)) return { error: "Lead not found." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write a note first." };
  if (body.length > 2000) return { error: "Note is too long (max 2000 characters)." };

  const { error } = await ctx.supabase.from("lead_activities").insert({
    clinic_id: ctx.profile.clinic_id,
    lead_id: leadId,
    type: "note",
    body,
    created_by: ctx.profile.id,
  });
  if (error) return { error: "Could not save the note." };

  refreshLeadPages(leadId);
  return { message: "Note added." };
}

export async function convertLead(id: string): Promise<{ error?: string }> {
  const ctx = await getContext();
  if ("error" in ctx) return { error: ctx.error };
  if (!isUuid(id)) return { error: "Lead not found." };

  const { error } = await ctx.supabase.rpc("convert_lead_to_patient", {
    p_lead_id: id,
  });
  if (error) {
    return {
      error: error.message.includes("already converted")
        ? "This lead is already a patient."
        : "Could not convert the lead.",
    };
  }

  refreshLeadPages(id);
  return {};
}

export type DuplicateMatches = {
  leads: { id: string; full_name: string }[];
  patients: { id: string; full_name: string }[];
};

// Used by the add/edit form to warn about the same phone number.
export async function checkPhone(
  phone: string,
  excludeLeadId?: string,
): Promise<DuplicateMatches> {
  const empty = { leads: [], patients: [] };
  const ctx = await getContext();
  const normalized = normalizePkPhone(phone);
  if ("error" in ctx || !normalized) return empty;

  let leadQuery = ctx.supabase
    .from("leads")
    .select("id, full_name")
    .eq("phone", normalized)
    .limit(3);
  if (excludeLeadId && isUuid(excludeLeadId)) {
    leadQuery = leadQuery.neq("id", excludeLeadId);
  }
  const [leads, patients] = await Promise.all([
    leadQuery,
    ctx.supabase
      .from("patients")
      .select("id, full_name")
      .eq("phone", normalized)
      .limit(3),
  ]);

  return { leads: leads.data ?? [], patients: patients.data ?? [] };
}
