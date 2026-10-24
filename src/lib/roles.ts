export const ROLE_LABELS = {
  owner: "Owner",
  admin: "Admin",
  doctor: "Doctor",
  receptionist: "Receptionist",
} as const;

export type Role = keyof typeof ROLE_LABELS;

// Roles an owner can give to new staff (there is only one owner per clinic).
export const STAFF_ROLES: Role[] = ["admin", "doctor", "receptionist"];

export function isStaffRole(value: string): value is Role {
  return (STAFF_ROLES as string[]).includes(value);
}
