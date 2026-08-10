import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Sign in | Class Event Tracker",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "admin" ? "/admin" : "/");
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center p-4">
        <LoginForm />
      </div>
    </>
  );
}
