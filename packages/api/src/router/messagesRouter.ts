import type { TRPCRouterRecord } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

import type { Message } from "@acme/db/schema";
import { desc, eq } from "@acme/db";
import { messages } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const messagesRouter = {
  post: protectedProcedure
    .input(
      z.object({
        threadId: z.number().min(1),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { threadId, content } = input;

      const [newMessage] = await ctx.db
        .insert(messages)
        .values({ threadId, content, senderId: ctx.uid })
        .returning();

      try {
        await ctx.redisPublisher.publish(
          `thread:${threadId}:messages`,
          JSON.stringify(newMessage),
        );
        return { status: "delivered" as const };
      } catch (error) {
        console.error("Redis publish failed:", error);
        return {
          status: "partial_delivery" as const,
          message:
            "Message saved but real-time notification failed. Recipients may need to refresh.",
        };
      }
    }),

  getMessages: protectedProcedure
    .input(
      z.object({
        threadId: z.number().min(1),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = 15;
      const res = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.threadId, input.threadId))
        .orderBy(desc(messages.timestamp))
        .limit(limit)
        .offset(input.cursor ? input.cursor * limit : 0);

      const sortedMessages = res.reverse();

      return {
        messages: sortedMessages,
        nextCursor: res.length === limit ? (input.cursor ?? 0) + 1 : undefined,
      };
    }),

  subscribeToMessages: publicProcedure
    .input(z.object({ threadId: z.number().min(1) }))
    .subscription(({ ctx, input }) => {
      const channel = `thread:${input.threadId}:messages`;

      return observable<Message>((emit) => {
        const onMessage = (_channel: string, message: string) => {
          try {
            const parsedMessage = JSON.parse(message) as Message;
            emit.next(parsedMessage);
          } catch (err) {
            console.error("Failed to parse message:", err);
          }
        };

        void ctx.redisSubscriber.subscribe(channel, (err) => {
          if (err) {
            emit.error(err);
            return;
          }

          ctx.redisSubscriber.on("message", onMessage);
        });

        return () => {
          ctx.redisSubscriber.removeListener("message", onMessage);
          ctx.redisSubscriber.unsubscribe(channel).catch((err) => {
            console.error("Failed to unsubscribe:", err);
          });
        };
      });
    }),
} satisfies TRPCRouterRecord;
