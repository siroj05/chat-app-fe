import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getConversationApi, getConversationsListApi, targetUserApi } from "./conversations.api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export const useTargetUser = () => {
    const queryClient = useQueryClient()
    const router = useRouter()
    return useMutation({
        mutationFn: targetUserApi,
        onSuccess: async (data) => {
            toast.success("Conversation created successfully")
            // Await invalidation so the sidebar fetches the new conversation
            // and joins its WS room before the user can start messaging.
            await queryClient.invalidateQueries({ queryKey: ["conversations"] })
            router.push(`/chat?q=${data.conversationId}`)
        },
        onError: (error) => {
            toast.error(error.message)
            console.log(error)
        }
    })
}

export const useGetConversation = (id : string) => {
    return useQuery({
        queryKey: ["conversation", id],
        queryFn: () => getConversationApi(id),
        enabled: !!id,
    })
}

export const useGetConversationsList = () => {
    return useQuery({
        queryKey: ["conversations"],
        queryFn: getConversationsListApi,
    });
}