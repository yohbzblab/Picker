-- Add AI compliment generation quota tracking (user-wide, no reset)
ALTER TABLE "users"
ADD COLUMN "aiComplimentGenerateCount" INTEGER NOT NULL DEFAULT 0;

