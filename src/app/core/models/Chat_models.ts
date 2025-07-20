
export interface UserMessageDto {
    message: string;
    language: string;
  }
  
  export interface ChatResponse {
    response: string;
  }
  
  export interface ChatMessage {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
    language?: string;
  }