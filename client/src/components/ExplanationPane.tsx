import React, { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { UsePopoverReturn } from "../hooks/usePopover";

interface ExplanationPaneProps {
  popover: UsePopoverReturn;
}

const ExplanationPane: React.FC<ExplanationPaneProps> = ({ popover }) => {
  const { isVisible, selectedText, activeTab, tabData, switchTab, updateSearchText } = popover;
  const [localText, setLocalText] = useState(selectedText);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local text when selected text changes externally
  useEffect(() => {
    setLocalText(selectedText);
  }, [selectedText]);

  const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    if (newText.length <= 100) {
      setLocalText(newText);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer to update after 500ms of no typing
      debounceTimerRef.current = setTimeout(() => {
        updateSearchText(newText);
      }, 500);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleContentSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (!selectedText || selectedText.length === 0) {
      return;
    }

    // Trigger new search with selected text from within the pane
    updateSearchText(selectedText);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dictionary":
        return <DictionaryTab data={tabData.dictionary} onTextSelection={handleContentSelection} />;
      case "wikipedia":
        return <WikipediaTab data={tabData.wikipedia} onTextSelection={handleContentSelection} />;
      case "ai":
        return <AITab data={tabData.ai} onTextSelection={handleContentSelection} />;
    }
  };

  return (
    <div className={`explanation-pane ${isVisible ? "active" : ""}`}>
      {isVisible && (
        <>
          {/* Header with editable search text and close button */}
          <div className="explanation-header">
            <input
              type="text"
              className="explanation-selected-text"
              value={localText}
              onChange={handleSearchTextChange}
              maxLength={100}
              placeholder="Search..."
            />
            <button
              className="explanation-close-button"
              onClick={popover.hidePopover}
              aria-label="Close explanation pane"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="explanation-tabs">
            <button
              className={`explanation-tab ${activeTab === "dictionary" ? "active" : ""}`}
              onClick={() => switchTab("dictionary")}
            >
              Dictionary
            </button>
            <button
              className={`explanation-tab ${activeTab === "wikipedia" ? "active" : ""}`}
              onClick={() => switchTab("wikipedia")}
            >
              Wikipedia
            </button>
            <button
              className={`explanation-tab ${activeTab === "ai" ? "active" : ""}`}
              onClick={() => switchTab("ai")}
            >
              AI
            </button>
          </div>

          {/* Tab Content */}
          <div className="explanation-body">{renderTabContent()}</div>
        </>
      )}
    </div>
  );
};

// Dictionary Tab Component
const DictionaryTab: React.FC<{
  data: { data: DictionaryEntry[] | null; loading: boolean; error: string | null };
  onTextSelection: () => void;
}> = ({ data, onTextSelection }) => {
  if (data.loading) {
    return (
      <div className="explanation-loading">
        <div className="spinner"></div>
        <p>Loading dictionary...</p>
      </div>
    );
  }

  if (data.error) {
    return <div className="explanation-error">{data.error}</div>;
  }

  if (!data.data || data.data.length === 0) {
    return <div className="explanation-empty-state">No definition found</div>;
  }

  const entry = data.data[0];

  return (
    <div className="dictionary-content" onMouseUp={onTextSelection}>
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
  onTextSelection: () => void;
}> = ({ data, onTextSelection }) => {
  if (data.loading) {
    return (
      <div className="explanation-loading">
        <div className="spinner"></div>
        <p>Loading Wikipedia...</p>
      </div>
    );
  }

  if (data.error) {
    return <div className="explanation-error">{data.error}</div>;
  }

  if (!data.data) {
    return <div className="explanation-empty-state">No Wikipedia article found</div>;
  }

  const wiki = data.data;

  return (
    <div className="wikipedia-content" onMouseUp={onTextSelection}>
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
  onTextSelection: () => void;
}> = ({ data, onTextSelection }) => {
  if (data.loading && !data.data) {
    return (
      <div className="explanation-loading">
        <div className="spinner"></div>
        <p>Asking AI...</p>
      </div>
    );
  }

  if (data.error) {
    return <div className="explanation-error">{data.error}</div>;
  }

  if (!data.data && !data.loading) {
    return <div className="explanation-empty-state">No AI response</div>;
  }

  return (
    <div className="ai-content" onMouseUp={onTextSelection}>
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

export default ExplanationPane;
