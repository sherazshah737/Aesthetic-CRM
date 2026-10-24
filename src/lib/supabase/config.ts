// True when the Supabase keys are present in .env.local.
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export const NOT_CONFIGURED_MESSAGE =
  "Supabase is not set up yet. Add your keys to .env.local and restart.";
