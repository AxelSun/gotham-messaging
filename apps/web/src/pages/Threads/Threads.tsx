import { useState } from "react";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useAuth } from "@/providers/AuthProvider";
import { LogOut } from "lucide-react";

import { Button } from "@acme/ui";

import { ChatView } from "./ChatView";
import { NewThreadDialog } from "./NewThreadDialog";
import { ThreadList } from "./ThreadList";

export const Threads = () => {
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const { logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleThreadSelect = (threadId: number) => {
    setActiveThreadId(threadId);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b p-4">
        <h1 className="text-xl font-semibold">Gotham Messenger</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full border-r md:w-1/3">
          <ThreadList
            onThreadSelect={handleThreadSelect}
            onAddNewThread={onOpen}
            activeThreadId={activeThreadId}
          />
        </div>
        <div className="hidden w-2/3 md:block">
          {activeThreadId ? (
            <ChatView threadId={activeThreadId} />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Select a conversation or start a new one
            </div>
          )}
        </div>
        <NewThreadDialog isOpen={isOpen} onClose={onClose} />
      </div>
    </div>
  );
};
