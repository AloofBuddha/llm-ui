import { useState, useCallback, useRef } from "react";

export type TabType = "dictionary" | "wikipedia" | "ai";

interface Position {
  x: number;
  y: number;
}

interface DictionaryDefinition {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

interface WikipediaResult {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  pageUrl: string;
}

interface TabData {
  dictionary: {
    data: DictionaryDefinition[] | null;
    loading: boolean;
    error: string | null;
  };
  wikipedia: {
    data: WikipediaResult | null;
    loading: boolean;
    error: string | null;
  };
  ai: {
    data: string;
    loading: boolean;
    error: string | null;
  };
}

export interface UsePopoverReturn {
  isVisible: boolean;
  selectedText: string;
  activeTab: TabType;
  position: Position | null;
  tabData: TabData;
  showPopover: (text: string, context: string, pos: Position) => void;
  hidePopover: () => void;
  switchTab: (tab: TabType) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const usePopover = (): UsePopoverReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [context, setContext] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("dictionary");
  const [position, setPosition] = useState<Position | null>(null);

  const [tabData, setTabData] = useState<TabData>({
    dictionary: { data: null, loading: false, error: null },
    wikipedia: { data: null, loading: false, error: null },
    ai: { data: "", loading: false, error: null },
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Determine smart default tab based on word count
  const getDefaultTab = (text: string): TabType => {
    const wordCount = text.trim().split(/\s+/).length;
    return wordCount === 1 ? "dictionary" : "wikipedia";
  };

  // Fetch AI explanation via SSE
  const fetchAI = useCallback(async (text: string, ctx: string) => {
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setTabData((prev) => ({
      ...prev,
      ai: { data: "", loading: true, error: null },
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spanText: text,
          context: ctx
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI explanation");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let accumulatedData = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              setTabData((prev) => ({
                ...prev,
                ai: { data: accumulatedData, loading: false, error: null },
              }));
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.token) {
                accumulatedData += parsed.token;
                setTabData((prev) => ({
                  ...prev,
                  ai: { data: accumulatedData, loading: true, error: null },
                }));
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
              if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
                throw e;
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return; // Silently handle abort
      }
      setTabData((prev) => ({
        ...prev,
        ai: {
          data: "",
          loading: false,
          error: error instanceof Error ? error.message : "Failed to fetch AI explanation",
        },
      }));
    }
  }, []);

  // Fetch Wikipedia API
  const fetchWikipedia = useCallback(async (text: string, ctx: string) => {
    setTabData((prev) => ({
      ...prev,
      wikipedia: { data: null, loading: true, error: null },
    }));

    try {
      const searchQuery = encodeURIComponent(text.trim());
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${searchQuery}`
      );

      if (!response.ok) {
        throw new Error("No Wikipedia article found");
      }

      const data = await response.json();
      const result: WikipediaResult = {
        title: data.title,
        extract: data.extract,
        thumbnail: data.thumbnail,
        pageUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${searchQuery}`,
      };

      setTabData((prev) => ({
        ...prev,
        wikipedia: { data: result, loading: false, error: null },
      }));
    } catch (error) {
      const wordCount = text.trim().split(/\s+/).length;
      const isMultiWord = wordCount > 1;

      setTabData((prev) => ({
        ...prev,
        wikipedia: {
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to fetch Wikipedia",
        },
      }));

      // Fallback to AI when Wikipedia fails
      setActiveTab("ai");
      fetchAI(text, ctx);
    }
  }, [fetchAI]);

  // Fetch Dictionary API
  const fetchDictionary = useCallback(async (text: string, ctx: string) => {
    const word = text.trim().split(/\s+/)[0].toLowerCase(); // Use first word for multi-word selections

    setTabData((prev) => ({
      ...prev,
      dictionary: { data: null, loading: true, error: null },
    }));

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );

      if (!response.ok) {
        throw new Error("Word not found in dictionary");
      }

      const data = await response.json();
      setTabData((prev) => ({
        ...prev,
        dictionary: { data, loading: false, error: null },
      }));
    } catch (error) {
      setTabData((prev) => ({
        ...prev,
        dictionary: {
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to fetch dictionary",
        },
      }));

      // Fallback: dictionary → wikipedia → AI
      setActiveTab("wikipedia");
      fetchWikipedia(text, ctx);
    }
  }, [fetchWikipedia]);

  // Show popover and load default tab
  const showPopover = useCallback(
    (text: string, ctx: string, pos: Position) => {
      setSelectedText(text);
      setContext(ctx);
      setPosition(pos);
      setIsVisible(true);

      // Reset all tab data
      setTabData({
        dictionary: { data: null, loading: false, error: null },
        wikipedia: { data: null, loading: false, error: null },
        ai: { data: "", loading: false, error: null },
      });

      // Determine and set default tab
      const defaultTab = getDefaultTab(text);
      setActiveTab(defaultTab);

      // Load default tab data
      if (defaultTab === "dictionary") {
        fetchDictionary(text, ctx);
      } else if (defaultTab === "wikipedia") {
        fetchWikipedia(text, ctx);
      } else if (defaultTab === "ai") {
        fetchAI(text, ctx);
      }
    },
    [fetchDictionary, fetchWikipedia, fetchAI]
  );

  // Hide popover
  const hidePopover = useCallback(() => {
    setIsVisible(false);
    setSelectedText("");
    setContext("");
    setPosition(null);

    // Abort any in-flight AI requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Switch tab and lazy load if needed
  const switchTab = useCallback(
    (tab: TabType) => {
      setActiveTab(tab);

      // Lazy load data if not already loaded
      if (tab === "dictionary" && !tabData.dictionary.data && !tabData.dictionary.loading && !tabData.dictionary.error) {
        fetchDictionary(selectedText, context);
      } else if (tab === "wikipedia" && !tabData.wikipedia.data && !tabData.wikipedia.loading && !tabData.wikipedia.error) {
        fetchWikipedia(selectedText, context);
      } else if (tab === "ai" && !tabData.ai.data && !tabData.ai.loading && !tabData.ai.error) {
        fetchAI(selectedText, context);
      }
    },
    [selectedText, context, tabData, fetchDictionary, fetchWikipedia, fetchAI]
  );

  return {
    isVisible,
    selectedText,
    activeTab,
    position,
    tabData,
    showPopover,
    hidePopover,
    switchTab,
  };
};
