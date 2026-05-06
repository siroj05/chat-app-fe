import { z } from "zod";

export const sendMessageSchema = z.object({
    message : z.string().min(1).max(4000).min(1, "Message is required"),
})

export type SendMessageSchema = z.infer<typeof sendMessageSchema>;