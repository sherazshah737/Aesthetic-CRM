export const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      {children}
      {hint && <span className="block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}
