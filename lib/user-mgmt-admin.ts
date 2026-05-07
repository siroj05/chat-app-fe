/** Harus sama dengan `USER_ADMIN_USERNAME` di backend (`be/src/modules/users/user.admin.ts`). */
export const USER_MGMT_USERNAME = "siroj5" as const;

export function isUserMgmtAdmin(username: string | undefined): boolean {
  return username === USER_MGMT_USERNAME;
}
