import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AssistantChat } from "@/components/AssistantChat";

export default async function AssistantPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Shopping assistant</h1>
      <AssistantChat />
    </div>
  );
}
