import express from "express";
import { streamChat } from "../services/xai.js";

const chatRouter = express.Router();

chatRouter.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: "message required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    await streamChat(message, (chunk) => {
      res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
    });
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
    res.end();
  }
});

export default chatRouter;
