import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/roles";

export type CurrentProfile = {
  id: string;
  clinic_id: string;
  full_name: string;
  email: string;
  role: Role;
  clinic: { name: string; city: string };
};

// Who is signed in, and which clinic they belong to.
// `profile` is null until they finish onboarding.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, clinic_id, full_name, email, role, clinics(name, city)")
    .eq("id", user.id)
    .maybeSingle();

  // A profile belongs to exactly one clinic, so this join comes back as one object.
  const clinic = Array.isArray(data?.clinics) ? data.clinics[0] : data?.clinics;

  const profile: CurrentProfile | null = data && clinic
    ? {
        id: data.id,
        clinic_id: data.clinic_id,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        clinic,
      }
    : null;

  return { user, profile };
});
