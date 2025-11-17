import OpenAI from "openai";
import { XAI_API_KEY } from "../config/env.js";

const client = new OpenAI({
  apiKey: XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export async function streamChat(
  userMessage: string,
  onToken: (token: string) => void
): Promise<void> {
  const stream = await client.chat.completions.create({
    model: "grok-4-fast-reasoning",
    stream: true,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      onToken(content);
    }
  }
}
