import { api } from "@/api/base_url"
import { GetMessagesRes } from "./messages.types"

export const getMessagesApi = async (id : string) => {
    const res= await api.get<GetMessagesRes>(`/api/messages/${id}`)
    return res.data
}