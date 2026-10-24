export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true">
      <div className="h-6 w-40 rounded bg-stone-200" />
      <div className="h-32 rounded-2xl bg-stone-200" />
    </div>
  );
}
