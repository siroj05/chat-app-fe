import { api } from "@/api/base_url"
import { GetConversationRes } from "./conversations.types";

export const targetUserApi = async (id : string) => {
    const res = await api.post<{conversationId : string}>('/api/conversations',
        {
            targetUserId : id
        }
    );
    return res.data;
}

export const getConversationApi = async (id : string) => {
    const res = await api.get<GetConversationRes>(`/api/conversations/${id}`)
    return res.data;
}