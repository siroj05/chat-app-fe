import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getConversationApi, getConversationsListApi, targetUserApi } from "./conversations.api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export const useTargetUser = () => {
    const queryClient = useQueryClient()
    const router = useRouter()
    return useMutation({
        mutationFn: targetUserApi,
        onSuccess: (data) => {
            toast.success("Conversation created successfully")
            router.push(`/chat?q=${data.conversationId}`)
            queryClient.invalidateQueries({ queryKey: ["conversations"] })
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