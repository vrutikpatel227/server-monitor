import { PrismaClient } from "@prisma/client";
const db=new PrismaClient();
async function main(){
 await db.$executeRawUnsafe('DROP INDEX IF EXISTS "Setting_key_key"');
 await db.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "Setting_workspaceId_key_key" ON "Setting" ("workspaceId","key")');
 console.log("Setting uniqueness fixed");
}
main().finally(()=>db.$disconnect());
