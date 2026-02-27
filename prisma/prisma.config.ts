import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

export default defineConfig({
  schema: path.join(__dirname, "schema.prisma"),
  migrations: {
    path: path.join(__dirname, "migrations"),
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
