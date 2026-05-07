import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoginRes } from "@/api/services/auth/auth.types"
import { useRouter } from "next/navigation"

export function DropdownAction({user, onlogout, isPending, showUserMgmt}: {user: LoginRes, onlogout: () => void, isPending: boolean, showUserMgmt?: boolean}) {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" className="rounded-full w-10 h-10 bg-primary text-primary-foreground">{user.username.split("")[0].toUpperCase()}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
          {showUserMgmt && (
            <DropdownMenuItem onClick={() => router.push("/users/manage")}>
              Kelola user
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onlogout}>
          {isPending ? "Logging out..." : "Logout"}
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
