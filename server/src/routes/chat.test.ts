import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import express from "express";
import request from "supertest";
import chatRouter from "./chat.js";
import * as claudeService from "../services/claude.js";

describe("POST /lookup", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api", chatRouter);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if spanText is missing", async () => {
    const response = await request(app)
      .post("/api/lookup")
      .send({ context: "some context" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("spanText and context required");
  });

  it("should return 400 if context is missing", async () => {
    const response = await request(app)
      .post("/api/lookup")
      .send({ spanText: "term" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("spanText and context required");
  });

  it("should stream tokens when spanText and context are provided", async () => {
    const mockTokens = ["Hello", " ", "this", " is", " Claude"];

    // Spy on streamLookup
    const streamLookupSpy = vi.spyOn(claudeService, "streamLookup");
    streamLookupSpy.mockImplementation(
      async (
        spanText: string,
        context: string,
        onToken: (t: string) => void
      ) => {
        for (const token of mockTokens) {
          onToken(token);
        }
      }
    );

    const response = await request(app).post("/api/lookup").send({
      spanText: "chain-of-thought",
      context: "The model used chain-of-thought reasoning...",
    });

    expect(response.status).toBe(200);
    expect(response.type).toBe("text/event-stream");

    // Verify SSE format in response text
    expect(response.text).toContain('data: {"token":"Hello"}');
    expect(response.text).toContain('data: {"token":" "}');
    expect(response.text).toContain("[DONE]");

    expect(streamLookupSpy).toHaveBeenCalledWith(
      "chain-of-thought",
      "The model used chain-of-thought reasoning...",
      expect.any(Function)
    );
  });

  it("should handle errors from streamLookup", async () => {
    const errorMsg = "API rate limit exceeded";

    const streamLookupSpy = vi.spyOn(claudeService, "streamLookup");
    streamLookupSpy.mockImplementation(async () => {
      throw new Error(errorMsg);
    });

    const response = await request(app).post("/api/lookup").send({
      spanText: "term",
      context: "context",
    });

    expect(response.status).toBe(200); // SSE still returns 200
    expect(response.text).toContain(`"error":"${errorMsg}"`);
  });

  it("should accept and use messageId field", async () => {
    const streamLookupSpy = vi.spyOn(claudeService, "streamLookup");
    streamLookupSpy.mockImplementation(
      async (
        spanText: string,
        context: string,
        onToken: (t: string) => void
      ) => {
        onToken("response");
      }
    );

    const response = await request(app).post("/api/lookup").send({
      spanText: "term",
      context: "context",
      messageId: "msg_123",
    });

    expect(response.status).toBe(200);
    expect(streamLookupSpy).toHaveBeenCalled();
  });
});
