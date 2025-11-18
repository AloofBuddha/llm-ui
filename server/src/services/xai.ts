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
        role: "system",
        content: "When using LaTeX math notation, always wrap inline math with $...$ (single dollars) and display math with $$...$$ (double dollars). For example: $\\mathcal{C}$ for inline or $$\\sum_{i=1}^{n}$$ for display math.",
      },
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

export async function streamExplanation(
  spanText: string,
  context: string,
  onToken: (token: string) => void
): Promise<void> {
  const stream = await client.chat.completions.create({
    model: "grok-4-fast-reasoning",
    stream: true,
    max_tokens: 150,
    messages: [
      {
        role: "system",
        content: "You provide quick, insightful explanations. CRITICAL: Your response must not exceed 150 words under any circumstances. Be extremely concise and direct - give just the key insight needed to understand the selected text. When using LaTeX math notation, always wrap inline math with $...$ (single dollars) and display math with $$...$$ (double dollars).",
      },
      {
        role: "user",
        content: `Context: ${context}\n\nGive a quick insight to help understand: "${spanText}"\n\nIMPORTANT: Maximum 150 words.`,
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
