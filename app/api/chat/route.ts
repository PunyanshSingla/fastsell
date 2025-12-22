import {
  type UIMessage,
  convertToModelMessages ,
  streamText,
} from "ai";
import { auth } from "@clerk/nextjs/server";
import { createShoppingAgent } from "@/lib/ai/shopping-agent";
import { google } from "@ai-sdk/google";

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();
  const { userId } = await auth();
  const { instructions, tools } = createShoppingAgent({ userId });
  const result = streamText({
    model: google("gemini-1.5-flash"),
    system: instructions,
    tools,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
