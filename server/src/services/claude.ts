import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function streamChat(
  spanText: string,
  context: string,
  onToken: (token: string) => void
): Promise<void> {
  const stream = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 300,
    stream: true,
    system: `You are a helpful assistant explaining technical terms concisely.
Given a phrase, provide a 2-3 sentence explanation with optional sources.
Be conversational and match the tone of Claude.`,
    messages: [
      {
        role: "user",
        content: `Explain this term: "${spanText}"\n\nContext: ${context}`,
      },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      onToken(event.delta.text);
    }
  }
}
