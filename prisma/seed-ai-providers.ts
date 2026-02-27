import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createCipheriv, randomBytes, createHash } from "crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function encrypt(plainText: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required");
  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv, { authTagLength: 16 });
  let encrypted = cipher.update(plainText, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

// Fill in your API keys here before running
const providers = [
  {
    provider: "gemini",
    apiKey: process.env.GEMINI_API_KEY ?? "",
    model: "gemini-2.5-flash-lite",
    isActive: true,
  },
  {
    provider: "groq",
    apiKey: process.env.GROQ_API_KEY ?? "",
    model: "llama-4-scout-17b-16e",
    isActive: true,
  },
  {
    provider: "mistral",
    apiKey: process.env.MISTRAL_API_KEY ?? "",
    model: "mistral-small-latest",
    isActive: true,
  },
];

async function main() {
  console.log("Setting up AI providers...\n");

  for (const p of providers) {
    const encryptedKey = encrypt(p.apiKey);

    await prisma.aiProviderConfig.upsert({
      where: { provider: p.provider },
      update: {
        apiKey: encryptedKey,
        model: p.model,
        isActive: p.isActive,
      },
      create: {
        provider: p.provider,
        apiKey: encryptedKey,
        model: p.model,
        isActive: p.isActive,
      },
    });

    console.log(`  ${p.provider} — model: ${p.model} — active: ${p.isActive}`);
  }

  console.log("\nDone! 3 providers configured (Gemini + Groq + Mistral)");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
