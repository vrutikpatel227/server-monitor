import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {getWorkspaceId} from "@/lib/workspace";
export async function GET(){
 const workspaceId=await getWorkspaceId();const since=new Date(Date.now()-24*60*60*1000);
 const [monitors,incidents,alerts,history,servers]=await Promise.all([
  db.monitor.findMany({where:{workspaceId},orderBy:{createdAt:"desc"},include:{checks:{orderBy:{checkedAt:"desc"},take:1}}}),
  db.incident.findMany({where:{monitor:{workspaceId}},orderBy:{startedAt:"desc"},take:20,include:{monitor:{select:{name:true}}}}),
  db.alert.findMany({where:{workspaceId},orderBy:{sentAt:"desc"},take:20}),
  db.monitorCheck.findMany({where:{monitor:{workspaceId},checkedAt:{gte:since}},select:{monitorId:true,status:true,responseTimeMs:true}}),
  db.server.count({where:{workspaceId}})
 ]);
 const total=monitors.length,online=monitors.filter(x=>x.status==="UP").length,offline=monitors.filter(x=>x.status==="DOWN").length,degraded=monitors.filter(x=>x.status==="DEGRADED").length;
 const responses=history.map(x=>x.responseTimeMs).filter((x):x is number=>x!=null);const avgResponse=responses.length?Math.round(responses.reduce((a,b)=>a+b,0)/responses.length):0;
 const byMonitor=new Map<string,{total:number;up:number}>();for(const check of history){const item=byMonitor.get(check.monitorId)??{total:0,up:0};item.total++;if(check.status==="UP")item.up++;byMonitor.set(check.monitorId,item);}
 const enriched=monitors.map(m=>{const item=byMonitor.get(m.id);return {...m,uptime:item?.total?Math.round(item.up/item.total*10000)/100:0};});
 return NextResponse.json({monitors:enriched,incidents,alerts,stats:{total,online,offline,degraded,servers,avgResponse,uptime:history.length?Math.round(history.filter(x=>x.status==="UP").length/history.length*10000)/100:0,activeIncidents:incidents.filter(x=>x.status==="OPEN").length}});
}
