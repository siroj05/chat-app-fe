import { api } from "@/api/base_url";
import { GetMessagesRes, SendMessageBody } from "./messages.types";

export const getMessagesApi = async (
  id: string,
  params?: { limit?: number; cursor?: string }
) => {
  const res = await api.get<GetMessagesRes>(`/api/messages/${id}`, { params });
  return res.data;
};

export const sendMessageApi = async (body: SendMessageBody) => {
  const res = await api.post(`/api/messages`, body);
  return res.data;
};