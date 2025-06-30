import type { User, Message, Chat } from '@prisma/client';

export interface FullChat extends Chat {
  participants: {
    user: User;
  }[];
  messages: Message[];
} 