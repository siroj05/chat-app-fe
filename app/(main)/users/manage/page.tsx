"use client";

import { useMe } from "@/api/services/auth";
import {
  useCreateManagedUser,
  useDeleteManagedUser,
  useManagedUsers,
  usePatchManagedUser,
} from "@/api/services/users";
import type { ManagedUser } from "@/api/services/users/users-mgmt.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isUserMgmtAdmin } from "@/lib/user-mgmt-admin";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ManageUsersPage() {
  const router = useRouter();
  const { data: meData, isSuccess: meReady, isPending: meLoading } = useMe();
  const username = meData?.user?.username;

  useEffect(() => {
    if (!meReady) return;
    if (!isUserMgmtAdmin(username)) {
      router.replace("/chat");
    }
  }, [meReady, username, router]);

  const {
    data: listData,
    isPending: listLoading,
    isError,
    error: listError,
    refetch,
  } = useManagedUsers(username);

  const createMut = useCreateManagedUser();
  const patchMut = usePatchManagedUser();
  const deleteMut = useDeleteManagedUser();

  const [createOpen, setCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<ManagedUser | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const [deleteUser, setDeleteUser] = useState<ManagedUser | null>(null);

  useEffect(() => {
    if (editUser) {
      setEditUsername(editUser.username);
      setEditPassword("");
    }
  }, [editUser]);

  if (!meReady || meLoading || !isUserMgmtAdmin(username)) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
        Memuat…
      </div>
    );
  }

  const users = listData?.users ?? [];

  async function submitCreate() {
    const u = newUsername.trim();
    const p = newPassword.trim();
    if (u.length < 3 || p.length < 6) return;
    await createMut.mutateAsync({ username: u, password: p });
    setCreateOpen(false);
    setNewUsername("");
    setNewPassword("");
  }

  async function submitEdit() {
    if (!editUser) return;
    const u = editUsername.trim();
    const p = editPassword.trim();
    const body: { username?: string; password?: string } = {};
    if (u.length >= 3 && u !== editUser.username) body.username = u;
    if (p.length >= 6) body.password = p;
    if (Object.keys(body).length === 0) {
      setEditOpen(false);
      return;
    }
    await patchMut.mutateAsync({ userId: editUser.id, body });
    setEditOpen(false);
    setEditUser(null);
  }

  async function confirmDelete() {
    if (!deleteUser) return;
    await deleteMut.mutateAsync(deleteUser.id);
    setDeleteUser(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Kelola user</h2>
          <p className="text-sm text-muted-foreground">
            Hapus user juga menghapus pesan mereka (foreign key CASCADE). Akun{" "}
            <code className="text-xs">{username}</code> saja yang punya akses.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/chat")}
          >
            ← Kembali ke chat
          </Button>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Tambah user
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void refetch()}
            disabled={listLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Gagal memuat daftar: {listError instanceof Error ? listError.message : String(listError)}
        </p>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 && !listLoading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Belum ada user.
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.username}</TableCell>
                <TableCell className="text-muted-foreground">
                  {(() => {
                    try {
                      return new Date(u.created_at).toLocaleString();
                    } catch {
                      return u.created_at;
                    }
                  })()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditUser(u);
                      setEditOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteUser(u)}
                  >
                    Hapus
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User baru</DialogTitle>
            <DialogDescription>
              Username 3–32 karakter, password minimal 6 karakter.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              autoComplete="off"
            />
            <Input
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => void submitCreate()}
              disabled={
                createMut.isPending ||
                newUsername.trim().length < 3 ||
                newPassword.trim().length < 6
              }
            >
              {createMut.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Kosongkan password jika tidak ingin mengganti.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="Username"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              autoComplete="off"
            />
            <Input
              type="password"
              placeholder="Password baru (opsional)"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                setEditUser(null);
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => void submitEdit()}
              disabled={
                patchMut.isPending ||
                editUsername.trim().length < 3 ||
                (editPassword.length > 0 && editPassword.length < 6)
              }
            >
              {patchMut.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteUser(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus user?</AlertDialogTitle>
            <AlertDialogDescription>
              User <strong>{deleteUser?.username}</strong> akan dihapus beserta pesan
              yang dikirimnya. Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMut.isPending}
              onClick={() => void confirmDelete()}
            >
              {deleteMut.isPending ? "Menghapus…" : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
