import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  await db.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS "Workspace" ("id" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id"))');
  await db.$executeRawUnsafe('INSERT INTO "Workspace" ("id") VALUES (\'legacy-workspace\') ON CONFLICT ("id") DO NOTHING');
  for (const table of ["Monitor","Server","Alert","Setting","StatusPage"]) {
    await db.$executeRawUnsafe('ALTER TABLE "' + table + '" ADD COLUMN IF NOT EXISTS "workspaceId" TEXT');
    await db.$executeRawUnsafe('UPDATE "' + table + '" SET "workspaceId"=\'legacy-workspace\' WHERE "workspaceId" IS NULL');
    await db.$executeRawUnsafe('ALTER TABLE "' + table + '" ALTER COLUMN "workspaceId" SET NOT NULL');
  }
  await db.$executeRawUnsafe('ALTER TABLE "Setting" DROP CONSTRAINT IF EXISTS "Setting_key_key"');
  await db.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "Setting_workspaceId_key_key" ON "Setting" ("workspaceId","key")');
  await db.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Monitor_workspaceId_status_idx" ON "Monitor" ("workspaceId","status")');
  await db.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Server_workspaceId_idx" ON "Server" ("workspaceId")');
  await db.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Alert_workspaceId_sentAt_idx" ON "Alert" ("workspaceId","sentAt")');
  await db.$executeRawUnsafe('ALTER TABLE "Monitor" ADD CONSTRAINT "Monitor_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE');
  await db.$executeRawUnsafe('ALTER TABLE "Server" ADD CONSTRAINT "Server_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE');
  await db.$executeRawUnsafe('ALTER TABLE "Alert" ADD CONSTRAINT "Alert_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE');
  await db.$executeRawUnsafe('ALTER TABLE "Setting" ADD CONSTRAINT "Setting_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE');
  await db.$executeRawUnsafe('ALTER TABLE "StatusPage" ADD CONSTRAINT "StatusPage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE');
  console.log("Workspace migration complete");
}

main().finally(() => db.$disconnect());
