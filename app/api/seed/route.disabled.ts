import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {getWorkspaceId} from "@/lib/workspace";
export async function GET(){
 const workspaceId=await getWorkspaceId();
 const items=[
  {name:"Demo Website",url:"https://example.com",type:"WEBSITE" as const,status:"UP" as const,httpStatus:200},
  {name:"Demo API",url:"https://httpbin.org/get",type:"API" as const,status:"UP" as const,httpStatus:200},
  {name:"Demo API Error",url:"https://httpbin.org/status/404",type:"API" as const,status:"DEGRADED" as const,httpStatus:404}
 ];
 for(const item of items){
  let m=await db.monitor.findFirst({where:{workspaceId,name:item.name}});
  if(!m)m=await db.monitor.create({data:{workspaceId,name:item.name,url:item.url,type:item.type,method:"GET",expectedStatus:200,intervalSeconds:60,timeoutMs:8000,nextCheckAt:new Date()}});
  const count=await db.monitorCheck.count({where:{monitorId:m.id}});
  if(!count){
   await db.monitorCheck.create({data:{monitorId:m.id,status:item.status,httpStatus:item.httpStatus,statusName:item.httpStatus===200?"OK":"Not Found",statusExplanation:item.httpStatus===200?"Request completed successfully":"The endpoint returned an unexpected HTTP status.",responseTimeMs:item.status==="UP"?128:342}});
   await db.monitor.update({where:{id:m.id},data:{status:item.status,lastCheckedAt:new Date(),nextCheckAt:new Date(Date.now()+60000)}});
  }
  if(item.status==="DEGRADED"&&!await db.incident.findFirst({where:{monitorId:m.id,status:"OPEN"}}))await db.incident.create({data:{monitorId:m.id,title:"Unexpected HTTP status",message:"Demo endpoint returned HTTP 404 instead of expected 200.",httpStatus:404}});
 }
 let server=await db.server.findFirst({where:{workspaceId,name:"Demo Windows Server"}});
 if(!server)server=await db.server.create({data:{workspaceId,name:"Demo Windows Server",hostname:"DEMO-PC",status:"UP",os:"Windows 11",agentVersion:"1.0.0",lastHeartbeatAt:new Date()}});
 const metricCount=await db.serverMetric.count({where:{serverId:server.id}});
 if(!metricCount)await db.serverMetric.create({data:{serverId:server.id,cpu:38.4,ram:61.7,disk:47.2,networkMbps:18.6,uptimeSeconds:172800}});
 let agent=await db.agent.findFirst({where:{serverId:server.id}});
 if(!agent)await db.agent.create({data:{serverId:server.id,name:"Demo Agent",tokenHash:"demo-token-hash",version:"1.0.0",os:"Windows 11",lastHeartbeatAt:new Date()}});
 await db.setting.upsert({where:{workspaceId_key:{workspaceId,key:"email"}},update:{value:"tester@example.com"},create:{workspaceId,key:"email",value:"tester@example.com"}});
 await db.setting.upsert({where:{workspaceId_key:{workspaceId,key:"emailAlerts"}},update:{value:"true"},create:{workspaceId,key:"emailAlerts",value:"true"}});
 await db.alert.create({data:{workspaceId,type:"TEST",message:"Demo alert: SERVER MONITOR notification pipeline test."}});
 let page=await db.statusPage.findFirst({where:{workspaceId,name:"Demo Status Page"}});
 if(!page)page=await db.statusPage.create({data:{workspaceId,name:"Demo Status Page",slug:"demo-status-"+workspaceId,enabled:true}});
 const main=await db.monitor.findFirst({where:{workspaceId,name:"Demo Website"}});
 if(main&&!await db.statusPageMonitor.findFirst({where:{statusPageId:page.id,monitorId:main.id}}))await db.statusPageMonitor.create({data:{statusPageId:page.id,monitorId:main.id}});
 return NextResponse.json({ok:true,workspaceId,monitors:items.length,server:server.name,message:"Demo data ready"});
}