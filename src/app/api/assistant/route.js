import { getCurrentUser } from "@/lib/auth";
import { getAccount } from "@/lib/shopApi";
import { chatWithAssistant } from "@/lib/assistant";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await request.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Missing messages", { status: 400 });
  }

  const account = await getAccount();
  const result = await chatWithAssistant(messages, { balance: account.balance });

  return Response.json(result);
}
