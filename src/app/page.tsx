import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Clinic CRM
      </h1>
      <p className="max-w-xs text-zinc-600">
        Leads, patients, appointments and payments for your clinic.
      </p>
      <Link
        href="/login"
        className="w-full max-w-xs rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-700"
      >
        Login
      </Link>
    </main>
  );
}
