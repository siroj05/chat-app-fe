"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data: { user: LoginRes }) => {
      queryClient.setQueryData(["auth"], data);
      toast.success("Login berhasil, selamat datang " + data.user.username);
      router.replace("/chat");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Login gagal"));
    },
  });
};

export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerApi,
    onSuccess: (data: { user: LoginRes }) => {
      queryClient.setQueryData(["auth"], data);
      toast.success("Register berhasil, selamat datang " + data.user.username);
      router.replace("/chat");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Register gagal"));
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["auth"] });
      toast.success("Logout berhasil");
      router.replace("/login");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Logout gagal"));
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["auth"],
    queryFn: meApi,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
};