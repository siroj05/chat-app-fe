"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  createManagedUserApi,
  deleteManagedUserApi,
  listManagedUsersApi,
  patchManagedUserApi,
} from "./users-mgmt.api";
import type { CreateManagedUserReq, PatchManagedUserReq } from "./users-mgmt.types";
import { isUserMgmtAdmin } from "@/lib/user-mgmt-admin";

export const MANAGED_USERS_QUERY_KEY = ["users-manage-list"] as const;

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

function invalidateAfterUserWrite(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: MANAGED_USERS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: ["conversations"] });
}

export function useManagedUsers(username: string | undefined) {
  return useQuery({
    queryKey: MANAGED_USERS_QUERY_KEY,
    queryFn: listManagedUsersApi,
    enabled: isUserMgmtAdmin(username),
  });
}

export function useCreateManagedUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateManagedUserReq) => createManagedUserApi(body),
    onSuccess: () => {
      toast.success("User berhasil dibuat");
      invalidateAfterUserWrite(queryClient);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Gagal membuat user"));
    },
  });
}

export function usePatchManagedUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: string;
      body: PatchManagedUserReq;
    }) => patchManagedUserApi(userId, body),
    onSuccess: () => {
      toast.success("User diperbarui");
      invalidateAfterUserWrite(queryClient);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Gagal memperbarui user"));
    },
  });
}

export function useDeleteManagedUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteManagedUserApi(userId),
    onSuccess: () => {
      toast.success("User dan pesan terkait dihapus");
      invalidateAfterUserWrite(queryClient);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Gagal menghapus user"));
    },
  });
}
