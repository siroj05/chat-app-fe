import { ConversationListItem } from "@/api/services/conversations/conversations.types";

interface Props {
    conversations: ConversationListItem[]
    selectConversation: (id: string) => void
    activeConversationId: string | null
}

export default function RenderConversations({
    conversations,
    selectConversation,
    activeConversationId
}: Props) {
    return (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
            {conversations.map((conversation) => {
                const active = conversation.conversation_id === activeConversationId;
                return (
                    <button
                        key={conversation.conversation_id}
                        type="button"
                        onClick={() => selectConversation(conversation.conversation_id)}
                        className={`w-full rounded-lg border p-3 text-left transition ${active
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background/40 hover:bg-background/70"
                            }`}
                    >
                        <div className="text-sm font-semibold text-primary">{conversation.username}</div>
                        <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {conversation.last_message ?? "Belum ada pesan"}
                        </div>
                    </button>
                );
            })}
        </div>
    )
}