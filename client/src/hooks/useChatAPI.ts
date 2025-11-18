import { useState, useRef, useCallback } from "react";
import { Message } from "../types";

interface UseChatAPIReturn {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  resetMessages: () => void;
  loadMessages: (msgs: Message[]) => void;
}

const useChatAPI = (): UseChatAPIReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, []);

  const loadMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs);
    setError(null);
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Create placeholder AI message
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      sender: "ai",
      text: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedContent = "";
      let lastUpdateTime = Date.now();
      const UPDATE_INTERVAL = 100; // Update UI every 100ms

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);

            // Check for [DONE] signal
            if (dataStr === "[DONE]") {
              continue;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data.token) {
                accumulatedContent += data.token;

                // Throttle updates to avoid breaking LaTeX rendering
                const now = Date.now();
                if (now - lastUpdateTime >= UPDATE_INTERVAL) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId
                        ? { ...msg, text: accumulatedContent }
                        : msg
                    )
                  );
                  lastUpdateTime = now;
                }
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // Silently ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Final update with all content
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, text: accumulatedContent } : msg
        )
      );

      setIsLoading(false);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
        // Remove the failed AI message
        setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId));
      }
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    clearError,
    resetMessages,
    loadMessages,
  };
};

export default useChatAPI;
