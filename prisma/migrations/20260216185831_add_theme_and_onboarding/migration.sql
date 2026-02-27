-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('DEFAULT', 'CUTE', 'OCEAN', 'SUNSET', 'FOREST', 'NEON', 'LAVENDER');

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "theme" "Theme" NOT NULL DEFAULT 'DEFAULT';
