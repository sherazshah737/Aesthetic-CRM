import { normalizePkPhone } from "@/lib/phone";
import { fromPktInput } from "@/lib/datetime";

export const LEAD_STATUSES = ["new", "contacted", "booked", "converted", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  booked: "Booked",
  converted: "Converted",
  lost: "Lost",
};

// Statuses a person can pick by hand. "Converted" happens via Convert to patient.
export const MANUAL_STATUSES = LEAD_STATUSES.filter((s) => s !== "converted");

export const LEAD_SOURCES = [
  "facebook",
  "instagram",
  "whatsapp",
  "walk_in",
  "referral",
  "website",
  "other",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const SOURCE_LABELS: Record<LeadSource, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  walk_in: "Walk-in",
  referral: "Referral",
  website: "Website",
  other: "Other",
};

export const LEAD_SERVICES = [
  "prp_face",
  "prp_hair",
  "vampire_facial",
  "hair_transplant",
  "other",
] as const;
export type LeadService = (typeof LEAD_SERVICES)[number];

export const SERVICE_LABELS: Record<LeadService, string> = {
  prp_face: "PRP Face",
  prp_hair: "PRP Hair",
  vampire_facial: "Vampire Facial",
  hair_transplant: "Hair Transplant",
  other: "Other",
};

export type Lead = {
  id: string;
  full_name: string;
  phone: string;
  source: LeadSource;
  service: LeadService;
  status: LeadStatus;
  next_followup_at: string | null;
  assigned_to: string | null;
  created_at: string;
};

export type StaffMember = { id: string; full_name: string };

export const isStatus = (v: string): v is LeadStatus =>
  (LEAD_STATUSES as readonly string[]).includes(v);
export const isSource = (v: string): v is LeadSource =>
  (LEAD_SOURCES as readonly string[]).includes(v);
export const isService = (v: string): v is LeadService =>
  (LEAD_SERVICES as readonly string[]).includes(v);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string) => UUID.test(v);

// WhatsApp link for a +92 number. Templates come in a later step.
export const whatsappLink = (phone: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}`;

export type LeadInput = {
  full_name: string;
  phone: string;
  source: LeadSource;
  service: LeadService;
  assigned_to: string | null;
  next_followup_at: string | null;
};

// Reads and checks the add/edit lead form.
export function parseLeadForm(
  formData: FormData,
): { error: string } | { data: LeadInput } {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = normalizePkPhone(String(formData.get("phone") ?? ""));
  const source = String(formData.get("source") ?? "");
  const service = String(formData.get("service") ?? "");
  const assignedTo = String(formData.get("assigned_to") ?? "");
  const followup = String(formData.get("next_followup_at") ?? "");

  if (!fullName) return { error: "Enter the lead's name." };
  if (fullName.length > 100) return { error: "Name is too long." };
  if (!phone) return { error: "Enter a valid Pakistani phone, e.g. 0300 1234567." };
  if (!isSource(source)) return { error: "Choose where the lead came from." };
  if (!isService(service)) return { error: "Choose the service they want." };
  if (assignedTo && !isUuid(assignedTo)) return { error: "Choose a valid staff member." };

  let nextFollowup: string | null = null;
  if (followup) {
    nextFollowup = fromPktInput(followup);
    if (!nextFollowup) return { error: "Enter a valid follow-up date and time." };
  }

  return {
    data: {
      full_name: fullName,
      phone,
      source,
      service,
      assigned_to: assignedTo || null,
      next_followup_at: nextFollowup,
    },
  };
}
