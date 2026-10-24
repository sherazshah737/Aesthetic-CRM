export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900">{title}</h1>
      <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
        <p className="text-sm text-stone-500">{description}</p>
        <p className="mt-1 text-xs text-stone-400">Coming in a later step.</p>
      </div>
    </div>
  );
}
