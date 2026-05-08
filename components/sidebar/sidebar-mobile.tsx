
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sheet, SheetContent } from "../ui/sheet";
import { RefreshCwIcon } from "lucide-react";

interface Props {
    openSidebar: boolean,
    setOpenSidebar: (open: boolean) => void,
    setOpen: (open: boolean) => void,
    renderConversationItems: React.ReactNode,
}

export default function SidebarMobile(
    { openSidebar, setOpenSidebar, setOpen, renderConversationItems }: Props
) {
    const queryClient = useQueryClient();
    return (
        <Sheet open={openSidebar} onOpenChange={setOpenSidebar}>
            <SheetContent
                side="left"
                className="flex w-1/3 min-h-0 min-w-0 flex-col bg-secondary"
                showCloseButton={false}
            >
                <div className="bg-primary/10 w-full flex gap-2 p-2">
                    <Input
                        role="button"
                        readOnly
                        onClick={() => setOpen(true)}
                        className="bg-secondary rounded-full cursor-pointer"
                        placeholder="Cari..."
                    />
                    <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["conversations"] })}
                        size="icon"
                        className="rounded-full">
                        <RefreshCwIcon className="my-auto" />
                    </Button>
                </div>
                {renderConversationItems}
            </SheetContent>
        </Sheet>
    )
}