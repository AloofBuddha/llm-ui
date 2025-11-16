import { useState } from 'react';
import { Message } from '../types';

// Demo messages for the chat interface
const DEMO_MESSAGES: Message[] = [
    {
        id: '1',
        sender: 'ai',
        text: 'The Grok API uses chain-of-thought reasoning to provide detailed explanations. Try double-clicking on technical terms to learn more!',
        timestamp: new Date('2025-01-15T10:00:00'),
    },
    {
        id: '2',
        sender: 'ai',
        text: 'You can use the OpenAI SDK with a custom baseURL to interact with xAI services. This makes integration seamless for developers.',
        timestamp: new Date('2025-01-15T10:01:00'),
    },
    {
        id: '3',
        sender: 'ai',
        text: 'Server-Sent Events (SSE) enable real-time streaming responses from the API, providing a better user experience for AI interactions.',
        timestamp: new Date('2025-01-15T10:02:00'),
    },
];

const useChat = () => {
    const [messages] = useState<Message[]>(DEMO_MESSAGES);
    const [loading] = useState(false);
    const [error] = useState<Error | null>(null);

    return { messages, loading, error };
};

export default useChat;