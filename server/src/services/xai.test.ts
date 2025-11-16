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

    await streamChat("test-term", "test context", mockOnToken);

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
      "chain-of-thought",
      "This is a context about reasoning.",
      mockOnToken
    );

    const callArgs = (
      clientMock.chat.completions.create as ReturnType<typeof vi.fn>
    ).mock.calls[0][0];

    expect(callArgs.model).toBe("grok-4-fast");
    expect(callArgs.max_tokens).toBe(300);
    expect(callArgs.stream).toBe(true);
    expect(callArgs.messages[0].role).toBe("system");
    expect(callArgs.messages[1].role).toBe("user");
    expect(callArgs.messages[1].content).toContain("chain-of-thought");
    expect(callArgs.messages[1].content).toContain(
      "This is a context about reasoning."
    );
  });

  it("should have proper system prompt", async () => {
    const mockAsyncIterator = {
      [Symbol.asyncIterator]: async function* () {
        yield { choices: [{ delta: {} }] };
      },
    };

    const clientMock = new OpenAI();
    (
      clientMock.chat.completions.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockAsyncIterator);

    await streamChat("term", "context", mockOnToken);

    const callArgs = (
      clientMock.chat.completions.create as ReturnType<typeof vi.fn>
    ).mock.calls[0][0];

    expect(callArgs.messages[0].role).toBe("system");
    expect(callArgs.messages[0].content).toContain("technical terms");
    expect(callArgs.messages[0].content).toContain("2-3 sentence explanation");
  });
});
