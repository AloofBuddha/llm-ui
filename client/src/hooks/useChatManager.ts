import { useState, useCallback } from "react";
import { Message } from "../types";

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
  messageCount: number;
}

interface UseChatManagerReturn {
  chats: Chat[];
  activeChat: string | null;
  currentMessages: Message[];
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  addMessageToActiveChat: (message: Message) => void;
  updateChatName: (chatId: string, name: string) => void;
  saveChat: (messages: Message[]) => void;
}

export const useChatManager = (): UseChatManagerReturn => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  // Generate a simple chat name from the first user message
  const generateChatName = (messages: Message[]): string => {
    const firstUserMessage = messages.find((m) => m.sender === "user");
    if (!firstUserMessage) return "New Chat";

    // Truncate to 40 characters
    const text = firstUserMessage.text;
    return text.length > 40 ? text.substring(0, 40) + "..." : text;
  };

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: "New Chat",
      messages: [],
      messageCount: 0,
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
  }, []);

  const selectChat = useCallback((chatId: string) => {
    setActiveChat(chatId);
  }, []);

  const addMessageToActiveChat = useCallback((message: Message) => {
    if (!activeChat) {
      // Create a new chat if none exists
      const newChat: Chat = {
        id: Date.now().toString(),
        name: "New Chat",
        messages: [message],
        messageCount: 1,
      };
      setChats([newChat]);
      setActiveChat(newChat.id);
      return;
    }

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChat) {
          const updatedMessages = [...chat.messages, message];
          const updatedChat = {
            ...chat,
            messages: updatedMessages,
            messageCount: updatedMessages.length,
          };

          // Update name if this is the first user message
          if (chat.name === "New Chat" && message.sender === "user") {
            updatedChat.name = generateChatName(updatedMessages);
          }

          return updatedChat;
        }
        return chat;
      })
    );
  }, [activeChat]);

  const saveChat = useCallback((messages: Message[]) => {
    if (messages.length === 0) return;

    if (!activeChat) {
      // Create new chat
      const newChat: Chat = {
        id: Date.now().toString(),
        name: generateChatName(messages),
        messages,
        messageCount: messages.length,
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChat(newChat.id);
    } else {
      // Update existing chat
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat
            ? {
                ...chat,
                messages,
                messageCount: messages.length,
                name: chat.name === "New Chat" ? generateChatName(messages) : chat.name,
              }
            : chat
        )
      );
    }
  }, [activeChat]);

  const updateChatName = useCallback((chatId: string, name: string) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, name } : chat))
    );
  }, []);

  const currentMessages =
    chats.find((chat) => chat.id === activeChat)?.messages || [];

  return {
    chats,
    activeChat,
    currentMessages,
    createNewChat,
    selectChat,
    addMessageToActiveChat,
    updateChatName,
    saveChat,
  };
};
