import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import express from "express";
import request from "supertest";
import chatRouter from "./chat.js";
import * as grokService from "../services/xai.js";

describe("POST /chat", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api", chatRouter);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if message is missing", async () => {
    const response = await request(app)
      .post("/api/chat")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("message required");
  });

  it("should stream tokens when message is provided", async () => {
    const mockTokens = ["Hello", " ", "this", " is", " Grok"];

    // Spy on streamChat
    const streamChatSpy = vi.spyOn(grokService, "streamChat");
    streamChatSpy.mockImplementation(
      async (
        message: string,
        onToken: (t: string) => void
      ) => {
        for (const token of mockTokens) {
          onToken(token);
        }
      }
    );

    const response = await request(app).post("/api/chat").send({
      message: "What is a dog?",
    });

    expect(response.status).toBe(200);
    expect(response.type).toBe("text/event-stream");

    // Verify SSE format in response text
    expect(response.text).toContain('data: {"token":"Hello"}');
    expect(response.text).toContain('data: {"token":" "}');
    expect(response.text).toContain("[DONE]");

    expect(streamChatSpy).toHaveBeenCalledWith(
      "What is a dog?",
      expect.any(Function)
    );
  });

  it("should handle errors from streamChat", async () => {
    const errorMsg = "API rate limit exceeded";

    const streamChatSpy = vi.spyOn(grokService, "streamChat");
    streamChatSpy.mockImplementation(async () => {
      throw new Error(errorMsg);
    });

    const response = await request(app).post("/api/chat").send({
      message: "Hello",
    });

    expect(response.status).toBe(200); // SSE still returns 200
    expect(response.text).toContain(`"error":"${errorMsg}"`);
  });
});
