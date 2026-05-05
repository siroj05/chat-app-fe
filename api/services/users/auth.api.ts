import { api } from "@/api/base_url";
import { SearchUsersRes } from "./auth.types";

export const searchUsersApi = async (query: string) => {
    const res = await api.get<SearchUsersRes>(`/api/users`,
        {
            params: {
                search: query
            }
        }
    );
    return res.data;
}