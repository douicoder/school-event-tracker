import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getEnv } from "@/config/env";
import * as schema from "./schema";

const env = getEnv();

export const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, { schema });

export { schema };
