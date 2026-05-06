export type GetConversationRes = {
    conversationId : string;
    username : string;
}

export type ConversationListItem = {
    conversation_id: string;
    username: string;
    last_message: string | null;
    last_message_at: string | null;
}

export type GetConversationsListRes = {
    conversations: ConversationListItem[];
}