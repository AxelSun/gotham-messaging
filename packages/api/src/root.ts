import { authRouter } from "./router/authRouter";
import { messagesRouter } from "./router/messagesRouter";
import { threadsRouter } from "./router/threadsRouter";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  messages: messagesRouter,
  threads: threadsRouter,
});

export type AppRouter = typeof appRouter;
