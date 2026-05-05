import { useQuery } from "@tanstack/react-query"
import { getMessagesApi } from "./messages.api"

export const useGetMessages = (id : string) => {
    return useQuery({
        queryKey: ["messages", id],
        queryFn: () => getMessagesApi(id),
        enabled: !!id,
    })
}