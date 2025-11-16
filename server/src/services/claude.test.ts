import { describe, it, expect, beforeEach, vi } from "vitest";
import { streamChat } from "./claude.js";
import Anthropic from "@anthropic-ai/sdk";

// Mock the Anthropic SDK
vi.mock("@anthropic-ai/sdk", () => {
  const mockCreate = vi.fn();
  return {
    default: vi.fn(() => ({
      messages: {
        create: mockCreate,
      },
    })),
    mockCreate,
  };
});

describe("Claude Service", () => {
  let mockOnToken: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnToken = vi.fn();
  });

  it("should call the token callback for each event", async () => {
    const mockEvents = [
      {
        type: "content_block_delta",
        delta: { type: "text_delta", text: "Hello" },
      },
      { type: "content_block_delta", delta: { type: "text_delta", text: " " } },
      {
        type: "content_block_delta",
        delta: { type: "text_delta", text: "World" },
      },
      { type: "message_stop" },
    ];

    const mockAsyncIterator = {
      [Symbol.asyncIterator]: async function* () {
        for (const event of mockEvents) {
          yield event;
        }
      },
    };

    const clientMock = new Anthropic();
    (clientMock.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockAsyncIterator
    );

    await streamChat("test-term", "test context", mockOnToken);

    // Verify onToken was called 3 times (for each text_delta event)
    expect(mockOnToken).toHaveBeenCalledTimes(3);
    expect(mockOnToken).toHaveBeenNthCalledWith(1, "Hello");
    expect(mockOnToken).toHaveBeenNthCalledWith(2, " ");
    expect(mockOnToken).toHaveBeenNthCalledWith(3, "World");
  });

  it("should format the request correctly", async () => {
    const mockAsyncIterator = {
      [Symbol.asyncIterator]: async function* () {
        yield { type: "message_stop" };
      },
    };

    const clientMock = new Anthropic();
    (clientMock.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockAsyncIterator
    );

    await streamChat(
      "chain-of-thought",
      "This is a context about reasoning.",
      mockOnToken
    );

    const callArgs = (clientMock.messages.create as ReturnType<typeof vi.fn>)
      .mock.calls[0][0];

    expect(callArgs.model).toBe("claude-3-5-sonnet-20241022");
    expect(callArgs.max_tokens).toBe(300);
    expect(callArgs.stream).toBe(true);
    expect(callArgs.messages[0].content).toContain("chain-of-thought");
    expect(callArgs.messages[0].content).toContain(
      "This is a context about reasoning."
    );
  });

  it("should have proper system prompt", async () => {
    const mockAsyncIterator = {
      [Symbol.asyncIterator]: async function* () {
        yield { type: "message_stop" };
      },
    };

    const clientMock = new Anthropic();
    (clientMock.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockAsyncIterator
    );

    await streamChat("term", "context", mockOnToken);

    const callArgs = (clientMock.messages.create as ReturnType<typeof vi.fn>)
      .mock.calls[0][0];

    expect(callArgs.system).toContain("technical terms");
    expect(callArgs.system).toContain("2-3 sentence explanation");
  });
});
