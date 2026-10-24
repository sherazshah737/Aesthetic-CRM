import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in | Clinic CRM" };

export default function LoginPage() {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-stone-900">Log in</h2>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-stone-500">
        New clinic?{" "}
        <Link href="/signup" className="font-medium text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
