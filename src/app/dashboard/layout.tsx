import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}

// Reads the signed-in user, so it must sit inside <Suspense>.
async function DashboardShell({ children }: { children: React.ReactNode }) {
  const session = await getCurrentUser();
  if (!session) redirect("/login");
  if (!session.profile) redirect("/onboarding");

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header profile={session.profile} />
        <main className="flex-1 px-4 py-6 pb-24 md:px-6 md:pb-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
