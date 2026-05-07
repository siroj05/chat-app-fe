import { useMutation, useQuery } from "@tanstack/react-query";
import { loginApi, logoutApi, meApi, registerApi } from "./auth.api";
import { LoginRes } from "./auth.types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message && data.message.length > 0) return data.message;
  }
  return fallback;
}
    
export const useLogin = () => {
    const router = useRouter()
    return useMutation({
        mutationFn: loginApi,
        onSuccess : (data : {user : LoginRes}) => {
            toast.success("Login berhasil, selamat datang " + data.user.username);
            router.push("/chat");
        },
        onError : (error) => {
            toast.error(getApiErrorMessage(error, "Login gagal"));
        },
    })
}
export const useRegister = () => {
    const router = useRouter()
    return useMutation({
        mutationFn: registerApi,
        onSuccess : (data : {user : LoginRes}) => {
            toast.success("Register berhasil, selamat datang " + data.user.username);
            router.push("/chat");
        },
        onError : (error) => {
            toast.error(getApiErrorMessage(error, "Register gagal"));
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
            toast.error(getApiErrorMessage(error, "Logout gagal"));
        },
    })
}

export const useMe = () => {
    return useQuery({
        queryKey: ["auth"],
        queryFn: meApi,
    })
}