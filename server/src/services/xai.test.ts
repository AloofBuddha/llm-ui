import { describe, it, expect, beforeEach, vi } from "vitest";
import { streamChat } from "./xai.js";
import OpenAI from "openai";

// Mock the OpenAI SDK
vi.mock("openai", () => {
  const mockCreate = vi.fn();
  return {
    default: vi.fn(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
    mockCreate,
  };
});

describe("XAI/Grok Service", () => {
  let mockOnToken: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnToken = vi.fn();
  });

  it("should call the token callback for each chunk", async () => {
    const mockChunks = [
      {
        choices: [{ delta: { content: "Hello" } }],
      },
      {
        choices: [{ delta: { content: " " } }],
      },
      {
        choices: [{ delta: { content: "World" } }],
      },
      {
        choices: [{ delta: {} }], // No content - end of stream
      },
    ];

    const mockAsyncIterator = {
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of mockChunks) {
          yield chunk;
        }
      },
    };

    const clientMock = new OpenAI();
    (
      clientMock.chat.completions.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockAsyncIterator);

    await streamChat("What is a dog?", mockOnToken);

    // Verify onToken was called 3 times (for each chunk with content)
    expect(mockOnToken).toHaveBeenCalledTimes(3);
    expect(mockOnToken).toHaveBeenNthCalledWith(1, "Hello");
    expect(mockOnToken).toHaveBeenNthCalledWith(2, " ");
    expect(mockOnToken).toHaveBeenNthCalledWith(3, "World");
  });

  it("should format the request correctly for Grok", async () => {
    const mockAsyncIterator = {
      [Symbol.asyncIterator]: async function* () {
        yield { choices: [{ delta: {} }] };
      },
    };

    const clientMock = new OpenAI();
    (
      clientMock.chat.completions.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockAsyncIterator);

    await streamChat(
      "What is chain-of-thought reasoning?",
      mockOnToken
    );

    const callArgs = (
      clientMock.chat.completions.create as ReturnType<typeof vi.fn>
    ).mock.calls[0][0];

    expect(callArgs.model).toBe("grok-4-fast-reasoning");
    expect(callArgs.max_tokens).toBeUndefined(); // No token limit
    expect(callArgs.stream).toBe(true);
    expect(callArgs.messages).toHaveLength(1); // Only user message, no system prompt
    expect(callArgs.messages[0].role).toBe("user");
    expect(callArgs.messages[0].content).toBe("What is chain-of-thought reasoning?");
  });

  it("should not include a system prompt for default Grok behavior", async () => {
    const mockAsyncIterator = {
      [Symbol.asyncIterator]: async function* () {
        yield { choices: [{ delta: {} }] };
      },
    };

    const clientMock = new OpenAI();
    (
      clientMock.chat.completions.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockAsyncIterator);

    await streamChat("Tell me about dogs", mockOnToken);

    const callArgs = (
      clientMock.chat.completions.create as ReturnType<typeof vi.fn>
    ).mock.calls[0][0];

    // No system message - just the user message
    expect(callArgs.messages).toHaveLength(1);
    expect(callArgs.messages[0].role).toBe("user");
    expect(callArgs.messages[0].content).toBe("Tell me about dogs");
  });
});
