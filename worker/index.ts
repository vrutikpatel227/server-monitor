import {db} from "../lib/db";
import {checkMonitor} from "../lib/monitor";
import {reconcileIncident} from "../lib/incidents";
import {createAlert} from "../lib/email-alerts";
let lastCleanup=0;
export async function runOnce(){
 const now=new Date();const monitors=await db.monitor.findMany({where:{nextCheckAt:{lte:now},agentId:null},take:50});
 for(const m of monitors){try{const c=await checkMonitor(m.id);const failed=c.status!=="UP";await reconcileIncident(m.id,failed,{title:m.name,message:c.failureMessage||c.statusName||(failed?"Monitor failed":"Monitor recovered"),httpStatus:c.httpStatus??undefined,failureType:c.failureType??undefined});if(c.sslDaysRemaining!=null&&c.sslDaysRemaining<=14&&c.sslDaysRemaining>=0)await createAlert({workspaceId:m.workspaceId,type:"SSL_EXPIRING",monitorId:m.id,message:`${m.name} SSL certificate expires in ${c.sslDaysRemaining} days.`,cooldownMinutes:1440});if(c.sslDaysRemaining!=null&&c.sslDaysRemaining<0)await createAlert({workspaceId:m.workspaceId,type:"SSL_EXPIRED",monitorId:m.id,message:`${m.name} SSL certificate has expired.`,cooldownMinutes:1440});}catch(e){console.error("monitor",m.id,e);}}
 const cutoff=new Date(Date.now()-90000);const servers=await db.server.findMany({where:{lastHeartbeatAt:{lt:cutoff},status:{not:"DOWN"}}});for(const server of servers){try{await db.server.update({where:{id:server.id},data:{status:"DOWN"}});await createAlert({workspaceId:server.workspaceId,type:"AGENT_OFFLINE",serverId:server.id,message:server.name+" agent is offline"});}catch(e){console.error("agent",server.id,e);}}
 if(Date.now()-lastCleanup>6*60*60*1000){lastCleanup=Date.now();try{const days=Number(process.env.RETENTION_DAYS||30),old=new Date(Date.now()-days*86400000);await db.monitorCheck.deleteMany({where:{checkedAt:{lt:old}}});await db.serverMetric.deleteMany({where:{recordedAt:{lt:old}}});}catch(e){console.error("retention",e);}}
 return {monitors:monitors.length,serversChecked:servers.length};
}
