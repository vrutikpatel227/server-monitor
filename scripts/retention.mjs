import {db} from "../lib/db.ts";
const days=Number(process.env.RETENTION_DAYS||30);const cutoff=new Date(Date.now()-days*86400000);
const checks=await db.monitorCheck.deleteMany({where:{checkedAt:{lt:cutoff}}});const metrics=await db.serverMetric.deleteMany({where:{recordedAt:{lt:cutoff}}});console.log(`Retention cleanup: ${checks.count} checks, ${metrics.count} metrics older than ${days} days removed.`);process.exit(0);
