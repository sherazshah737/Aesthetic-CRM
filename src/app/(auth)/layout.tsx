export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Clinic CRM
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          For aesthetic clinics in Pakistan
        </p>
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </main>
  );
}
