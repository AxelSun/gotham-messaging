import type { InferSelectModel } from "drizzle-orm";
import { relations, sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar({ length: 50 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const threads = pgTable(
  "threads",
  {
    id: serial("id").primaryKey(),
    user1Id: integer("user1_id")
      .notNull()
      .references(() => users.id),
    user2Id: integer("user2_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      uniqueUsers: unique("unique_users").on(table.user1Id, table.user2Id),
      checkUserOrder: check(
        "user_order",
        sql`${table.user1Id} < ${table.user2Id}`,
      ),
    };
  },
);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  threadId: integer()
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  senderId: integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text().notNull(),
  timestamp: timestamp().defaultNow().notNull(),
});

export type Message = InferSelectModel<typeof messages>;

export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  threadsAsUser1: many(threads),
  threadsAsUser2: many(threads),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  user1: one(users, {
    fields: [threads.user1Id],
    references: [users.id],
  }),
  user2: one(users, {
    fields: [threads.user2Id],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  thread: one(threads, {
    fields: [messages.threadId],
    references: [threads.id],
  }),
}));
