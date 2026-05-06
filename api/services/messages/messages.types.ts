export type GetMessagesRes = {
    messages : {
        id : string;
        sender_id : string;
        message : string;
        created_at : string;
    }[]
}

export type SendMessageBody = {
    conversationId : string;
    message : string;
}