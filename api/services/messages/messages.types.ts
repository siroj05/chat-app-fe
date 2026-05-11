export type MessageItem = {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

export type GetMessagesRes = {
  messages: MessageItem[];
  nextCursor: string | null;
};

export type SendMessageBody = {
  conversationId: string;
  message: string;
};