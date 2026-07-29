import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "@/components/RegisterForm";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/products");

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Create an account</h1>
      <RegisterForm />
    </div>
  );
}
