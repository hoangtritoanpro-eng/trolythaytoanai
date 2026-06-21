export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  imageUrl?: string; // Data URL for preview
  isError?: boolean;
}

export interface SendMessageParams {
  text: string;
  imageBase64?: string;
  mimeType?: string;
}
