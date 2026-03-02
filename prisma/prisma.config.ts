import path from "node:path";
import { defineConfig } from "prisma/config";

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const dotenv = require("dotenv");
  dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
} catch {
  // dotenv not available in production standalone — env is injected by Docker
}

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
