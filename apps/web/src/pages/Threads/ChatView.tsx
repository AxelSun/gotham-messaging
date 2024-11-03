import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { trpc } from "@/services/trpc";
import { Send } from "lucide-react";

import { Button, Input } from "@acme/ui";

interface ChatViewProps {
  threadId: number;
}

export const ChatView = ({ threadId }: ChatViewProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const { uid } = useAuth();

  const utils = trpc.useUtils();
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    trpc.messages.getMessages.useInfiniteQuery(
      { threadId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialCursor: 0,
        select: (data) => {
          const reversedPages = data.pages.slice().reverse();
          return {
            ...data,
            pages: reversedPages,
          };
        },
      },
    );

  trpc.messages.subscribeToMessages.useSubscription(
    { threadId },
    {
      onData: (_) => {
        // TODO instead of invalidate, we should just update the query cache
        utils.messages.getMessages.invalidate({ threadId });
      },
    },
  );

  const { mutateAsync } = trpc.messages.post.useMutation({
    onSuccess: () => {
      utils.messages.getMessages.invalidate({ threadId });
      utils.threads.getThreadsList.invalidate();
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const lastMessageId = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (isProgrammaticScroll.current) {
      isProgrammaticScroll.current = false;
      return;
    }

    const container = containerRef.current;
    if (!container || !initialScrollDone || isFetchingNextPage) return;

    if (container.scrollTop < 100 && hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, initialScrollDone, isFetchingNextPage, fetchNextPage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const allMessages = data?.pages.flatMap((page) => page.messages) ?? [];

  useEffect(() => {
    if (!isLoading && allMessages.length > 0 && !initialScrollDone) {
      if (containerRef.current) {
        isProgrammaticScroll.current = true;
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
      setInitialScrollDone(true);
      lastMessageId.current = allMessages[allMessages.length - 1].id;
      return;
    }

    if (initialScrollDone && !isLoading && allMessages.length > 0) {
      const lastMessage = allMessages[allMessages.length - 1];

      if (lastMessage.id !== lastMessageId.current) {
        lastMessageId.current = lastMessage.id;

        if (lastMessage.senderId === uid) {
          scrollToBottom();
        }
      }
    }
  }, [allMessages, isLoading, uid, initialScrollDone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await mutateAsync({
        threadId,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="message-container flex-1 overflow-y-auto"
      >
        {isFetchingNextPage && (
          <div className="sticky top-0 z-10 bg-background/80 p-2 text-center text-sm text-muted-foreground backdrop-blur-sm">
            Loading more messages...
          </div>
        )}
        {allMessages.map((message) => (
          <div
            key={message.id}
            className={`message-bubble ${
              message.senderId === uid ? "message-sent" : "message-received"
            }`}
          >
            {message.content}
            <div className="mt-1 text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            disabled={!newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
