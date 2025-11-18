import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { UsePopoverReturn } from "../hooks/usePopover";

interface EnhancedPopoverProps {
  popover: UsePopoverReturn;
}

const EnhancedPopover: React.FC<EnhancedPopoverProps> = ({ popover }) => {
  const { isVisible, selectedText, activeTab, position, tabData, hidePopover, switchTab } = popover;
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        hidePopover();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible, hidePopover]);

  if (!isVisible || !position) return null;

  // Adjust position to keep popover in viewport
  const getPopoverStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${position.x}px`,
      top: `${position.y}px`,
    };

    return baseStyle;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dictionary":
        return <DictionaryTab data={tabData.dictionary} />;
      case "wikipedia":
        return <WikipediaTab data={tabData.wikipedia} />;
      case "ai":
        return <AITab data={tabData.ai} />;
    }
  };

  return (
    <div className="popover-overlay">
      <div ref={popoverRef} className="popover-container" style={getPopoverStyle()}>
        {/* Header with selected text */}
        <div className="popover-header">
          <div className="popover-selected-text">{selectedText}</div>
          <button className="popover-close-button" onClick={hidePopover} aria-label="Close popover">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="popover-tabs">
          <button
            className={`popover-tab ${activeTab === "dictionary" ? "active" : ""}`}
            onClick={() => switchTab("dictionary")}
          >
            Dictionary
          </button>
          <button
            className={`popover-tab ${activeTab === "wikipedia" ? "active" : ""}`}
            onClick={() => switchTab("wikipedia")}
          >
            Wikipedia
          </button>
          <button
            className={`popover-tab ${activeTab === "ai" ? "active" : ""}`}
            onClick={() => switchTab("ai")}
          >
            AI
          </button>
        </div>

        {/* Tab Content */}
        <div className="popover-body">{renderTabContent()}</div>
      </div>
    </div>
  );
};

// Dictionary Tab Component
const DictionaryTab: React.FC<{
  data: { data: DictionaryEntry[] | null; loading: boolean; error: string | null };
}> = ({ data }) => {
  if (data.loading) {
    return (
      <div className="popover-loading">
        <div className="spinner"></div>
        <p>Loading dictionary...</p>
      </div>
    );
  }

  if (data.error) {
    return <div className="popover-error">{data.error}</div>;
  }

  if (!data.data || data.data.length === 0) {
    return <div className="popover-empty">No definition found</div>;
  }

  const entry = data.data[0];

  return (
    <div className="dictionary-content">
      <div className="dictionary-word">
        <strong>{entry.word}</strong>
        {entry.phonetic && <span className="phonetic">{entry.phonetic}</span>}
      </div>
      {entry.meanings.map((meaning, idx: number) => (
        <div key={idx} className="dictionary-meaning">
          <div className="part-of-speech">{meaning.partOfSpeech}</div>
          <ol>
            {meaning.definitions.slice(0, 3).map((def, defIdx: number) => (
              <li key={defIdx}>
                <div className="definition">{def.definition}</div>
                {def.example && <div className="example">&ldquo;{def.example}&rdquo;</div>}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
};

// Wikipedia Tab Component
const WikipediaTab: React.FC<{
  data: { data: WikipediaData | null; loading: boolean; error: string | null };
}> = ({ data }) => {
  if (data.loading) {
    return (
      <div className="popover-loading">
        <div className="spinner"></div>
        <p>Loading Wikipedia...</p>
      </div>
    );
  }

  if (data.error) {
    return <div className="popover-error">{data.error}</div>;
  }

  if (!data.data) {
    return <div className="popover-empty">No Wikipedia article found</div>;
  }

  const wiki = data.data;

  return (
    <div className="wikipedia-content">
      <h3 className="wikipedia-title">{wiki.title}</h3>
      {wiki.thumbnail && (
        <img
          src={wiki.thumbnail.source}
          alt={wiki.title}
          className="wikipedia-thumbnail"
        />
      )}
      <p className="wikipedia-extract">{wiki.extract}</p>
      <a
        href={wiki.pageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="wikipedia-link"
      >
        Read more on Wikipedia →
      </a>
    </div>
  );
};

// AI Tab Component
const AITab: React.FC<{
  data: { data: string; loading: boolean; error: string | null };
}> = ({ data }) => {
  if (data.loading && !data.data) {
    return (
      <div className="popover-loading">
        <div className="spinner"></div>
        <p>Asking AI...</p>
      </div>
    );
  }

  if (data.error) {
    return <div className="popover-error">{data.error}</div>;
  }

  if (!data.data && !data.loading) {
    return <div className="popover-empty">No AI response</div>;
  }

  return (
    <div className="ai-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {data.data}
      </ReactMarkdown>
      {data.loading && <span className="typing-indicator">▊</span>}
    </div>
  );
};

// Type definitions
interface DictionaryEntry {
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

interface WikipediaData {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  pageUrl: string;
}

export default EnhancedPopover;
