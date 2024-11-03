import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { publicProcedure } from "../trpc";

export const authRouter = {
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { username, password } = input;
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, username),
        columns: {
          id: true,
          username: true,
          password: true,
        },
      });

      console.log(user);

      const error = new TRPCError({
        message: "User not found or password incorrect",
        code: "FORBIDDEN",
      });

      if (!user) {
        throw error;
      }

      if (password !== user.password) {
        throw error;
      }

      return { id: user.id, username: user.username };
    }),
} satisfies TRPCRouterRecord;
