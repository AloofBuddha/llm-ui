export interface ChatRequest {
    message: string;
    userId: string;
}

export interface ChatResponse {
    response: string;
    additionalInfo?: string;
}

export interface Tooltip {
    content: string;
    isVisible: boolean;
}