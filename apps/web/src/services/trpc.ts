import {
  httpLink,
  loggerLink,
  splitLink,
  TRPCClientError,
  unstable_httpSubscriptionLink,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import type { AppRouter } from "@acme/api";

export const trpc = createTRPCReact<AppRouter>();

export function isTRPCClientError(
  cause: unknown,
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}

export const trpcClient = trpc.createClient({
  links: [
    loggerLink({
      enabled: () => process.env.NODE_ENV !== "production",
    }),
    splitLink({
      condition: (op) => op.type === "subscription",
      true: unstable_httpSubscriptionLink({
        url: `${import.meta.env.VITE_API_BASE_URL}/trpc`,
        transformer: superjson,
      }),
      false: httpLink({
        transformer: superjson,
        url: `${import.meta.env.VITE_API_BASE_URL}/trpc`,
        headers() {
          const id = sessionStorage.getItem("uid");
          return id ? { authorization: id } : {};
        },
      }),
    }),
  ],
});
