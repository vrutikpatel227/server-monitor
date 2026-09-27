import {NextRequest,NextResponse} from "next/server";
import {createHash,timingSafeEqual} from "node:crypto";
import {db} from "@/lib/db";
import {createAlert} from "@/lib/email-alerts";

async function alertOnce(serverId:string,type:string,message:string,workspaceId:string){
 const recent=await db.alert.findFirst({where:{workspaceId,serverId,type,sentAt:{gte:new Date(Date.now()-15*60*1000)}}});
 if(!recent)await createAlert({workspaceId,serverId,type,message});
}

export async function POST(req:NextRequest){
 try{
  const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!token)return NextResponse.json({error:"Unauthorized"},{status:401});
  const b=await req.json();if(!b.agentId)return NextResponse.json({error:"agentId required"},{status:400});
  const agent=await db.agent.findUnique({where:{id:b.agentId},include:{server:true}});if(!agent)return NextResponse.json({error:"Unknown agent"},{status:404});
  const hash=createHash("sha256").update(token).digest("hex");const valid=timingSafeEqual(Buffer.from(agent.tokenHash,"hex"),Buffer.from(hash,"hex"));if(!valid)return NextResponse.json({error:"Invalid agent token"},{status:401});
  const now=new Date(),serverId=agent.serverId,workspaceId=agent.server.workspaceId,m=b.metrics||{};
  await db.agent.update({where:{id:agent.id},data:{lastHeartbeatAt:now,version:b.version,os:b.os}});
  await db.server.update({where:{id:serverId},data:{status:"UP",lastHeartbeatAt:now,agentVersion:b.version,os:b.os,hostname:b.hostname}});
  if(agent.server.status==="DOWN")await createAlert({workspaceId,type:"AGENT_RECOVERED",serverId,message:agent.server.name+" agent recovered"});
  if(b.metrics){
   await db.serverMetric.create({data:{serverId,cpu:Number(m.cpu)||0,ram:Number(m.ram)||0,disk:Number(m.disk)||0,networkMbps:Number(m.networkMbps)||0,uptimeSeconds:BigInt(Math.floor(Math.max(0,Number(m.uptimeSeconds)||0)))}}); 
   if(Number(m.cpu)>90)await alertOnce(serverId,"HIGH_CPU",agent.server.name+" CPU is "+Number(m.cpu).toFixed(1)+"%",workspaceId);
   if(Number(m.ram)>90)await alertOnce(serverId,"HIGH_RAM",agent.server.name+" RAM is "+Number(m.ram).toFixed(1)+"%",workspaceId);
   if(Number(m.disk)>85)await alertOnce(serverId,"HIGH_DISK",agent.server.name+" disk is "+Number(m.disk).toFixed(1)+"%",workspaceId);
  }
  return NextResponse.json({ok:true});
 }catch(e:any){console.error("agent heartbeat",e);return NextResponse.json({error:e?.message||"Heartbeat failed"},{status:500});}
}
