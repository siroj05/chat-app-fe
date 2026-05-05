import { useQuery } from "@tanstack/react-query"
import { searchUsersApi } from "./auth.api"

export const useSearchUsers = (query: string) => {
    return useQuery({
        queryKey: ["users", query],
        queryFn: () => searchUsersApi(query),
        enabled: !!query,
    })
}