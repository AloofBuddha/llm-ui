import OpenAI from "openai";
import { XAI_API_KEY } from "../config/env.js";

const client = new OpenAI({
  apiKey: XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export async function streamChat(
  spanText: string,
  context: string,
  onToken: (token: string) => void
): Promise<void> {
  const stream = await client.chat.completions.create({
    model: "grok-4-fast",
    max_tokens: 300,
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant explaining technical terms concisely.
Given a phrase, provide a 2-3 sentence explanation with optional sources.
Be conversational and informative.`,
      },
      {
        role: "user",
        content: `Explain this term: "${spanText}"\n\nContext: ${context}`,
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
