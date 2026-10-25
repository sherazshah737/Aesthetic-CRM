import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/leads";

export function WhatsAppButton({
  phone,
  label = "WhatsApp",
}: {
  phone: string;
  label?: string;
}) {
  return (
    <a
      href={whatsappLink(phone)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
    >
      <MessageCircle className="size-3.5" aria-hidden />
      {label}
    </a>
  );
}
