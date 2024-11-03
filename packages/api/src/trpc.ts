import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import type { DbClient } from "@acme/db";
import { db } from "@acme/db";

import { redisPublisher, redisSubscriber } from "./utils/redis";

export interface Context {
  req: CreateFastifyContextOptions["req"];
  res: CreateFastifyContextOptions["res"];
  db: DbClient;
  redisPublisher: typeof redisPublisher;
  redisSubscriber: typeof redisSubscriber;
  uid: number;
}

export const createContext = (opts: CreateFastifyContextOptions): Context => {
  const uid = opts.req.headers.authorization
    ? parseInt(opts.req.headers.authorization)
    : 0;

  return {
    req: opts.req,
    res: opts.res,
    db,
    redisPublisher,
    redisSubscriber,
    uid,
  };
};

//export type Context = ReturnType<typeof createContext>;

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.uid) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        session: { ...ctx, uid: ctx.uid },
      },
    });
  }) as typeof t.procedure;
