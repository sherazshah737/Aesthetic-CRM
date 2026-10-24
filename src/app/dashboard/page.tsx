import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Dashboard | Clinic CRM" };

export default async function DashboardPage() {
  const session = await getCurrentUser();
  const name = session?.profile?.full_name.split(" ")[0];

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900">Welcome, {name}</h1>
      <p className="mt-1 text-sm text-stone-500">
        Today&apos;s numbers will show up here once leads and appointments are added.
      </p>
    </div>
  );
}
