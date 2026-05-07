export type ManagedUser = {
  id: string;
  username: string;
  created_at: string;
};

export type ListManagedUsersRes = {
  users: ManagedUser[];
};

export type ManagedUserSingleRes = {
  user: ManagedUser;
};

export type CreateManagedUserReq = {
  username: string;
  password: string;
};

export type PatchManagedUserReq = {
  username?: string;
  password?: string;
};
