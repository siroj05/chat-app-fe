import { api } from "@/api/base_url";
import type {
  CreateManagedUserReq,
  ListManagedUsersRes,
  ManagedUserSingleRes,
  PatchManagedUserReq,
} from "./users-mgmt.types";

export const listManagedUsersApi = async () => {
  const res = await api.get<ListManagedUsersRes>("/api/users/manage");
  return res.data;
};

export const getManagedUserApi = async (userId: string) => {
  const res = await api.get<ManagedUserSingleRes>(
    `/api/users/manage/${encodeURIComponent(userId)}`
  );
  return res.data;
};

export const createManagedUserApi = async (body: CreateManagedUserReq) => {
  const res = await api.post<ManagedUserSingleRes>("/api/users/manage", body);
  return res.data;
};

export const patchManagedUserApi = async (
  userId: string,
  body: PatchManagedUserReq
) => {
  const res = await api.patch<ManagedUserSingleRes>(
    `/api/users/manage/${encodeURIComponent(userId)}`,
    body
  );
  return res.data;
};

export const deleteManagedUserApi = async (userId: string) => {
  await api.delete(`/api/users/manage/${encodeURIComponent(userId)}`);
};
