import { useState } from "react";
import { isTRPCClientError, trpc } from "@/services/trpc";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  useToast,
} from "@acme/ui";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const NewThreadDialog = (props: Props) => {
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { mutateAsync, error, isPending } =
    trpc.threads.createNewThread.useMutation({
      onSuccess: () => utils.threads.getThreadsList.invalidate(),
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    try {
      await mutateAsync({ username });
      toast({
        title: "Thread created",
        description: `Started a conversation with ${username}`,
      });
      setUsername("");
      props.onClose();
    } catch (e) {
      if (isTRPCClientError(e)) {
        if (e.data?.code === "INTERNAL_SERVER_ERROR") {
          toast({
            title: "Internal Server Error",
            description: "Please try again later",
            variant: "destructive",
          });
        }
      }
      console.error(e);
    }
  };

  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="mt-1"
                required
              />
              {error && error.data?.httpStatus !== 500 && (
                <p className="mt-1 text-sm text-red-600">{error.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={props.onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black text-white transition-colors hover:bg-gray-800"
                disabled={isPending}
              >
                {isPending ? "Creating thread" : "Start Conversation"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
