import {db} from "../lib/db.ts";
import {createAlert} from "../lib/email-alerts.ts";
const workspaceId="cmui4iyez0001wg2wy5tdrf9z";
const alert=await createAlert({workspaceId,type:"TEST_AUTOMATIC",message:"Automatic alert pipeline test: SERVER MONITOR generated this alert and attempted to email the configured recipient."});
console.log(JSON.stringify({alertId:alert.id,type:alert.type,workspaceId:alert.workspaceId,createdAt:alert.createdAt},null,2));
process.exit(0);
