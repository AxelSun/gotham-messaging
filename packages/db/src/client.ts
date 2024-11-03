import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import * as schema from "./schema";

if (!process.env.POSTGRES_URL) {
  throw new Error("Missing POSTGRES_URL");
}

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
});

export type DbClient = ReturnType<typeof drizzle<typeof schema>>;
export const db = drizzle({
  client: pool,
  schema,
  casing: "snake_case",
});
