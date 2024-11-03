import { trpc } from "@/services/trpc";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import { Button } from "@acme/ui";

type Props = {
  activeThreadId: number | null;
  onThreadSelect: (id: number) => void;
  onAddNewThread: () => void;
};

export const ThreadList = (props: Props) => {
  const { data } = trpc.threads.getThreadsList.useQuery();

  const handleThreadClick = (threadId: number) => {
    props.onThreadSelect(threadId);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-xl font-semibold">Threads</h2>
        <Button size="icon" variant="ghost" onClick={props.onAddNewThread}>
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {data?.map((thread) => (
          <div
            key={thread.id}
            onClick={() => handleThreadClick(thread.id)}
            className={`cursor-pointer border-b p-4 transition-colors hover:bg-gray-50 ${
              props.activeThreadId === thread.id ? "bg-primary-light" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{thread.title}</h3>
                {thread.content && (
                  <>
                    <p className="truncate text-sm text-gray-600">
                      {thread.content}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {format(new Date(thread.timestamp), "p")}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
