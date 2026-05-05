"use client";
import { ClockIcon } from "lucide-react";

interface CardChatProps {
  conversation: {
    id: string;
    name: string;
    lastMessage: string;
    timeLabel: string;
  };
  selectConversation: (conversation: {id: string, name: string}) => void;
}

export default function CardChat({
  conversation,
  selectConversation,
}: CardChatProps) {
  return (
    <div
      role="button"
      onClick={() => selectConversation({id : conversation.id, name :conversation.name})}
      className="bg-card hover:bg-primary/10 cursor-pointer rounded-lg p-2 border flex justify-between"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold">{conversation.name}</h1>
        <p className="text-sm text-muted-foreground">
          {conversation.lastMessage}
        </p>
      </div>
      <div className="text-sm text-muted-foreground flex gap-2">
        <div className="flex gap-1">
          <p>{conversation.timeLabel}</p>
          <ClockIcon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
