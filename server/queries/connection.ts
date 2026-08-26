import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "../lib/env.ts";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

const sql = neon(env.databaseUrl);
const instance = drizzle(sql, { schema: fullSchema });

export function getDb() {
  return instance;
}