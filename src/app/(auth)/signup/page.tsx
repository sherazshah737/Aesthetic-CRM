import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Sign up | Clinic CRM" };

export default function SignupPage() {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-stone-900">Create your account</h2>
      <SignupForm />
      <p className="mt-4 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
