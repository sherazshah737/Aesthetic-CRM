import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  short: string; // shorter label for the mobile bottom bar
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Leads", short: "Leads", icon: UserPlus },
  { href: "/dashboard/patients", label: "Patients", short: "Patients", icon: Users },
  { href: "/dashboard/appointments", label: "Appointments", short: "Appts", icon: CalendarDays },
  { href: "/dashboard/packages", label: "Packages", short: "Packages", icon: Package },
  { href: "/dashboard/payments", label: "Payments", short: "Payments", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", short: "Settings", icon: Settings },
];

export function isActive(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}
