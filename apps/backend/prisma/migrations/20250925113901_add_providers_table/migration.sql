-- AlterTable
ALTER TABLE "users" ADD COLUMN "aiModel" TEXT;

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "free" BOOLEAN NOT NULL DEFAULT false,
    "models" TEXT NOT NULL,
    "tokenUrl" TEXT,
    "documentationUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "providers_name_key" ON "providers"("name");
