import { useMutation, useQuery } from "@tanstack/react-query";
import { loginApi, logoutApi, meApi } from "./auth.api";
import { LoginRes } from "./auth.types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
    
export const useLogin = () => {
    const router = useRouter()
    return useMutation({
        mutationFn: loginApi,
        onSuccess : (data : {user : LoginRes}) => {
            toast.success("Login berhasil, selamat datang " + data.user.username);
            router.push("/chat");
        },
        onError : (error) => {
            toast.error(error.message);
        },
    })
}

export const useLogout = () => {
    const router = useRouter()
    return useMutation({
        mutationFn: logoutApi,
        onSuccess : () => {
            toast.success("Logout berhasil");
            router.push("/login");
        },
        onError : (error) => {
            toast.error(error.message);
        },
    })
}

export const useMe = () => {
    return useQuery({
        queryKey: ["auth"],
        queryFn: meApi,
    })
}