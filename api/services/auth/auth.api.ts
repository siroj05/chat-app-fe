import { api } from "@/api/base_url";
import { LoginReq, LoginRes } from "./auth.types";

export const registerApi =  async (req : LoginReq) : Promise<LoginRes> => {
    const res = await api.post<LoginRes>("/api/auth/register", req);
    return res.data;
}

export const loginApi = async (req : LoginReq) : Promise<{user : LoginRes}> => {
    const res = await api.post<{user : LoginRes}>("/api/auth/login", req);
    return res.data;
}

export const logoutApi = async () : Promise<void> => {
    const res = await api.post<void>("/api/auth/logout");
    return res.data;
}

export const meApi = async () : Promise<{user : LoginRes}> => {
    const res = await api.get<{user : LoginRes}>("/api/auth/me");
    return res.data;
}