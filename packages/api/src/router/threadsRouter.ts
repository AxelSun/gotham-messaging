import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { threads } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const threadsRouter = {
  createNewThread: protectedProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, uid } = ctx;

      const user = await db.query.users.findFirst({
        columns: {
          id: true,
        },
        where: (users, { ilike }) => ilike(users.username, input.username),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${input.username} do not exist`,
        });
      }

      const [uid1, uid2] = uid < user.id ? [uid, user.id] : [user.id, uid];

      const existingThread = await db.query.threads.findFirst({
        where: (thread, { eq, and }) =>
          and(eq(thread.user1Id, uid1), eq(thread.user2Id, uid2)),
      });

      if (existingThread) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A thread with this user already exists",
        });
      }

      const [res] = await db
        .insert(threads)
        .values({ user1Id: uid1, user2Id: uid2 })
        .returning();

      return { threadId: res?.id };
    }),
  getThreadsList: protectedProcedure.query(async ({ ctx }) => {
    const { uid, db } = ctx;

    const res = await db.query.threads.findMany({
      where: (thread, { eq, or }) =>
        or(eq(thread.user1Id, uid), eq(thread.user2Id, uid)),
      with: {
        messages: {
          orderBy: (messages, { desc }) => desc(messages.timestamp),
          limit: 1,
        },
        user1: {
          columns: { id: true, username: true },
        },
        user2: {
          columns: { id: true, username: true },
        },
      },
    });

    return res
      .map((thread) => {
        const title =
          thread.user1Id === uid
            ? thread.user2.username
            : thread.user1.username;
        const content = thread.messages[0]?.content ?? "New thread";
        const timestamp = thread.messages[0]?.timestamp ?? thread.createdAt;
        return { id: thread.id, title, content, timestamp };
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }),
} satisfies TRPCRouterRecord;
