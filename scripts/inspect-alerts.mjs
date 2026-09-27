import {db} from "../lib/db.ts";
const rows=await db.setting.findMany({where:{key:{in:["email","emailAlerts","resendConnected"]}}});
console.log(rows.map(x=>({workspaceId:x.workspaceId,key:x.key,value:x.key==="email"?x.value:"[set]"})));
process.exit(0);
