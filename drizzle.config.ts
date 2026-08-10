import { defineConfig } from "drizzle-kit";
import { getEnv } from "./src/config/env";

const env = getEnv();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
