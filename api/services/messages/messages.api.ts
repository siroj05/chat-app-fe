import { api } from "@/api/base_url"
import { GetMessagesRes, SendMessageBody } from "./messages.types"

export const getMessagesApi = async (id : string) => {
    const res= await api.get<GetMessagesRes>(`/api/messages/${id}`)
    return res.data
}

export const sendMessageApi = async (body : SendMessageBody) => {
    const res = await api.post(`/api/messages`, body)
    return res.data
}