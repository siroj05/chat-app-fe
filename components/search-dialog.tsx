import { useSearchUsers } from "@/api/services/users";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useState } from "react";
import { Spinner } from "./ui/spinner";
import { MessageCircleIcon, PlusIcon } from "lucide-react";
import { useTargetUser } from "@/api/services/conversations";

export function SearchDialog({
  open,
  onOpenChange,
  onTargetUser,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTargetUser: (id: string) => void;
}) {
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const { debouncedValue, isDebouncing } = useDebounce(searchUserQuery, 500);
  const { data, isLoading, isError } = useSearchUsers(debouncedValue);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <div className="w-full relative">
          <Input
            placeholder="Search user..."
            value={searchUserQuery}
            onChange={(e) => setSearchUserQuery(e.target.value)}
          />
          {isDebouncing && (
            <Spinner className="absolute right-2 top-1/2 -translate-y-1/2" />
          )}
        </div>
        <div className="w-full border border-dashed p-2 rounded-lg space-y-2">
            {
                data?.users.map((user) => (
                    <div key={user.id} className="bg-secondary p-2 rounded-lg flex gap-5">
                        <Button onClick={() => onTargetUser(user.id)} variant="outline" size="icon" className="bg-primary rounded-full text-primary-foreground hover:bg-primary/80">
                            <MessageCircleIcon/>
                        </Button>
                        <p className="text-sm my-auto font-medium">{user.username}</p>
                    </div>
                ))
            }
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
