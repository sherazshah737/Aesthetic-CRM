import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Runs before pages load: keeps logged-out visitors out of the app.
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isPrivate =
    path.startsWith("/dashboard") || path.startsWith("/onboarding");
  const isAuthPage = path === "/login" || path === "/signup";

  let redirectTo: string | null = null;
  if (!user && isPrivate) redirectTo = "/login";
  if (user && isAuthPage) redirectTo = "/dashboard";

  if (!redirectTo) return response;

  const redirect = NextResponse.redirect(new URL(redirectTo, request.url));
  // Keep any refreshed session cookies on the redirect response.
  response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/login", "/signup"],
};
