"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm font-medium text-red-800">Something went wrong.</p>
      <button
        onClick={reset}
        className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-800"
      >
        Try again
      </button>
    </div>
  );
}
