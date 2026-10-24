export function FormAlert({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (!error && !message) return null;
  const isError = Boolean(error);
  return (
    <p
      role={isError ? "alert" : "status"}
      className={`rounded-lg px-3 py-2 text-sm ${
        isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {error ?? message}
    </p>
  );
}
