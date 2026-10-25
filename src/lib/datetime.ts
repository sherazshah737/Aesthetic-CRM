// All clinic times are Pakistan time (Asia/Karachi, UTC+5, no daylight saving).
const PKT = "Asia/Karachi";
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

// "2026-10-25T14:30" typed in a datetime-local box -> ISO string for the database.
export function fromPktInput(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00+05:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// ISO string from the database -> value for a datetime-local box.
export function toPktInput(iso: string | null): string {
  if (!iso) return "";
  return new Date(new Date(iso).getTime() + PKT_OFFSET_MS)
    .toISOString()
    .slice(0, 16);
}

export function formatPkt(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: PKT,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

// The last moment of today in Pakistan, as an ISO string.
export function endOfTodayPkt(now = Date.now()): string {
  const day = new Date(now + PKT_OFFSET_MS).toISOString().slice(0, 10);
  return new Date(`${day}T23:59:59.999+05:00`).toISOString();
}
