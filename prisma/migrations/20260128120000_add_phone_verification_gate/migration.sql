-- Add phone verification gate fields (apply to all existing users)
ALTER TABLE "users"
ADD COLUMN "phone" TEXT,
ADD COLUMN "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "phoneVerifiedAt" TIMESTAMP(3);

-- Unique phone per user (Postgres allows multiple NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_key" ON "users"("phone");

