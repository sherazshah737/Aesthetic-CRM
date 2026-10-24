"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  isSupabaseConfigured,
  NOT_CONFIGURED_MESSAGE,
} from "@/lib/supabase/config";
import { normalizePkPhone } from "@/lib/phone";
import type { ActionState } from "@/lib/action-state";

export async function createClinic(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED_MESSAGE };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const clinicName = String(formData.get("clinic_name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const phone = normalizePkPhone(String(formData.get("phone") ?? ""));

  if (!fullName) return { error: "Enter your name." };
  if (!clinicName) return { error: "Enter the clinic name." };
  if (!city) return { error: "Enter the city." };
  if (!phone) return { error: "Enter a valid Pakistani phone, e.g. 0300 1234567." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_clinic_with_owner", {
    p_full_name: fullName,
    p_clinic_name: clinicName,
    p_city: city,
    p_phone: phone,
  });
  if (error) return { error: "Could not set up your clinic. Please try again." };

  redirect("/dashboard");
}
