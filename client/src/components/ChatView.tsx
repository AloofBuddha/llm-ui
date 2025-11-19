import React, { useEffect, useRef, useState, lazy, Suspense } from "react";
import useChatAPI from "../hooks/useChatAPI";
import { usePopover } from "../hooks/usePopover";
import { useChatManager } from "../hooks/useChatManager";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import LeftPane from "./LeftPane";

// Lazy load ExplanationPane since it's only needed when user selects text
const ExplanationPane = lazy(() => import("./ExplanationPane"));

const ChatView: React.FC = () => {
  const chatManager = useChatManager();
  const { messages, sendMessage, isLoading, error, clearError, resetMessages, loadMessages } = useChatAPI();
  const popover = usePopover();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const displayMessages = messages;
  const hasMessages = displayMessages.length > 0;

  // Save chat to history when messages change and it's a new conversation
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      chatManager.saveChat(messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    clearError();

    // Create chat immediately on first message (shows left panel right away)
    const isFirstMessage = messages.length === 0 && chatManager.chats.length === 0;
    if (isFirstMessage) {
      chatManager.createNewChat();
      setIsTransitioning(true);
      // End transition after animation completes
      setTimeout(() => setIsTransitioning(false), 600);
    }

    await sendMessage(text);
  };

  const handleNewChat = () => {
    resetMessages();
    chatManager.createNewChat();
    popover.hidePopover();
  };

  const handleSelectChat = (chatId: string) => {
    const chat = chatManager.chats.find((c) => c.id === chatId);
    if (chat) {
      loadMessages(chat.messages);
      chatManager.selectChat(chatId);
      popover.hidePopover();
    }
  };

  // Empty state - centered input with left pane
  if (!hasMessages) {
    return (
      <div className="chat-view">
        <LeftPane
          chats={chatManager.chats}
          activeChat={chatManager.activeChat}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
        />
        <div className={`chat-view-empty-main ${isTransitioning ? "transitioning" : ""}`}>
          <div className="empty-state-container">
            <h1 className="empty-state-title">How can I help you today?</h1>
            <ChatInput
              onSend={handleSendMessage}
              disabled={isLoading}
            />
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={clearError}>Dismiss</button>
              </div>
            )}
          </div>
        </div>
        <div className="explanation-pane"></div>
      </div>
    );
  }

  // Chat state - left pane + messages + explanation pane
  return (
    <div className="chat-view">
      <LeftPane
        chats={chatManager.chats}
        activeChat={chatManager.activeChat}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      <div className={`chat-main ${isTransitioning ? "transitioning" : ""}`}>
        <div className="messages-container">
          {displayMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={isLoading && message.sender === "ai" && message.id === displayMessages[displayMessages.length - 1]?.id}
              popover={popover}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-fixed">
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={clearError}>Dismiss</button>
            </div>
          )}
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>

      <Suspense fallback={<div className="explanation-pane"></div>}>
        <ExplanationPane popover={popover} />
      </Suspense>
    </div>
  );
};

export default ChatView;
