// Turns 0300 1234567, 300-1234567, +92 300 1234567 etc. into +923001234567.
// Returns null if it doesn't look like a Pakistani number.
export function normalizePkPhone(input: string): string | null {
  const cleaned = input.replace(/[\s\-()]/g, "");
  const match = cleaned.match(/^(?:\+92|0092|92|0)?([1-9]\d{8,9})$/);
  return match ? `+92${match[1]}` : null;
}
