"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isSupabaseConfigured,
  NOT_CONFIGURED_MESSAGE,
} from "@/lib/supabase/config";
import { isStaffRole } from "@/lib/roles";
import type { ActionState } from "@/lib/action-state";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Owner adds a staff member. We create their login with a temporary password
// that the owner hands over; the staff member can then log in.
export async function addStaff(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED_MESSAGE };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is missing in .env.local." };
  }

  // Check on the server that the caller really is a clinic owner.
  const session = await getCurrentUser();
  if (!session?.profile || session.profile.role !== "owner") {
    return { error: "Only the clinic owner can add staff." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");

  if (!fullName) return { error: "Enter the staff member's name." };
  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email." };
  if (!isStaffRole(role)) return { error: "Choose a role." };

  const admin = createAdminClient();
  const tempPassword = randomBytes(9).toString("base64url");

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) {
    const exists = error?.message.toLowerCase().includes("already");
    return {
      error: exists
        ? "A user with this email already exists."
        : "Could not create the staff account.",
    };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    clinic_id: session.profile.clinic_id,
    full_name: fullName,
    email,
    role,
  });
  if (profileError) {
    // Don't leave a login without a clinic behind.
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: "Could not save the staff member. Please try again." };
  }

  revalidatePath("/dashboard/settings/team");
  return { message: `${fullName} was added.`, email, tempPassword };
}
