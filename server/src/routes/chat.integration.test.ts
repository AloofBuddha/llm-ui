import { describe, it, expect, beforeAll } from "vitest";
import express from "express";
import request from "supertest";
import chatRouter from "./chat.js";

describe("POST /chat - Integration Test with Grok", () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api", chatRouter);
  });

  it(
    "should successfully stream a response from Grok",
    async () => {
      const response = await request(app)
        .post("/api/chat")
        .send({
          message: "What is recursion in programming?",
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe("text/event-stream");

      // Check that we got SSE formatted data with tokens
      expect(response.text).toContain("data:");
      expect(response.text).toContain("[DONE]");

      // Verify we got actual content (not just error)
      expect(response.text).not.toContain('"error"');

      // Parse SSE response to check token content
      const lines = response.text
        .split("\n")
        .filter((line) => line.startsWith("data:"));
      expect(lines.length).toBeGreaterThan(1); // More than just [DONE]

      console.log(`✓ Received ${lines.length} SSE events from Grok`);
    },
    15000
  ); // 15 second timeout for real API call

  it("should handle missing parameters gracefully", async () => {
    const response = await request(app).post("/api/chat").send({
      // missing message
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("message required");
  });
});
