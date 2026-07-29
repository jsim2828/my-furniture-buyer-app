import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/products");

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Log in</h1>
      <LoginForm />
    </div>
  );
}
