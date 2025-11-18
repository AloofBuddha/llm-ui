import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { UsePopoverReturn, TabType } from "../hooks/usePopover";

interface ExplanationPaneProps {
  popover: UsePopoverReturn;
}

const ExplanationPane: React.FC<ExplanationPaneProps> = ({ popover }) => {
  const { isVisible, selectedText, activeTab, tabData, switchTab } = popover;

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
    <div className={`explanation-pane ${isVisible ? "active" : ""}`}>
      {isVisible && (
        <>
          {/* Header with selected text and close button */}
          <div className="explanation-header">
            <div className="explanation-selected-text">{selectedText}</div>
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
  data: { data: any; loading: boolean; error: string | null };
}> = ({ data }) => {
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
    <div className="dictionary-content">
      <div className="dictionary-word">
        <strong>{entry.word}</strong>
        {entry.phonetic && <span className="phonetic">{entry.phonetic}</span>}
      </div>
      {entry.meanings.map((meaning: any, idx: number) => (
        <div key={idx} className="dictionary-meaning">
          <div className="part-of-speech">{meaning.partOfSpeech}</div>
          <ol>
            {meaning.definitions.slice(0, 3).map((def: any, defIdx: number) => (
              <li key={defIdx}>
                <div className="definition">{def.definition}</div>
                {def.example && <div className="example">"{def.example}"</div>}
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
  data: { data: any; loading: boolean; error: string | null };
}> = ({ data }) => {
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

export default ExplanationPane;
