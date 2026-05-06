import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getMessagesApi, sendMessageApi } from "./messages.api"
import { toast } from "sonner"

export const useGetMessages = (id : string) => {
    return useQuery({
        queryKey: ["messages", id],
        queryFn: () => getMessagesApi(id),
        enabled: !!id,
    })
}

export const useSendMessage = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: sendMessageApi,
        onSuccess: () => {
            toast.success("Message sent successfully")
            queryClient.invalidateQueries({ queryKey: ["messages"] })
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
}