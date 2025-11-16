import { useState, useRef } from "react";

interface TooltipData {
  content: string;
  loading: boolean;
  error: string | null;
}

const useTooltip = () => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const lookup = async (spanText: string, context: string) => {
    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setTooltip({ content: "", loading: true, error: null });
    setIsVisible(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spanText, context }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                accumulatedContent += data.token;
                setTooltip((prev) =>
                  prev ? { ...prev, content: accumulatedContent, loading: false } : null
                );
              } else if (data.error) {
                setTooltip((prev) =>
                  prev
                    ? { ...prev, error: data.error, loading: false }
                    : null
                );
              }
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }
      }

      setTooltip((prev) => (prev ? { ...prev, loading: false } : null));
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Lookup failed:", error);
        setTooltip((prev) =>
          prev
            ? { ...prev, error: error.message, loading: false }
            : null
        );
      }
    }
  };

  const hideTooltip = () => {
    abortControllerRef.current?.abort();
    setTooltip(null);
    setIsVisible(false);
  };

  return {
    tooltip,
    isVisible,
    lookup,
    hideTooltip,
  };
};

export default useTooltip;
