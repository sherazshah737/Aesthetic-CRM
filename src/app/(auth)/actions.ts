"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  isSupabaseConfigured,
  NOT_CONFIGURED_MESSAGE,
} from "@/lib/supabase/config";
import type { ActionState } from "@/lib/action-state";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED_MESSAGE };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!EMAIL_PATTERN.test(email) || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Wrong email or password." };

  redirect("/dashboard");
}

export async function signup(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED_MESSAGE };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: error.message };

  // Supabase returns a user with no identities when the email already exists.
  if (data.user && data.user.identities?.length === 0) {
    return { error: "This email is already registered. Try logging in." };
  }

  // No session means the project requires email confirmation first.
  if (!data.session) {
    return {
      message: "Account created. Check your email and click the link to continue.",
    };
  }

  redirect("/onboarding");
}

export async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
