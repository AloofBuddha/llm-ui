export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export interface Tooltip {
    content: string;
    isVisible: boolean;
    position: {
        top: number;
        left: number;
    };
}