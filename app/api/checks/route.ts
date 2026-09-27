import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {getWorkspaceId} from "@/lib/workspace";
export async function GET(req:Request){
 const workspaceId=await getWorkspaceId();const url=new URL(req.url);const monitorId=url.searchParams.get("monitorId");const days=Math.min(30,Number(url.searchParams.get("days")||1));
 if(monitorId){const owner=await db.monitor.findFirst({where:{id:monitorId,workspaceId}});if(!owner)return NextResponse.json({error:"Monitor not found"},{status:404});}
 const checks=await db.monitorCheck.findMany({where:{monitorId:monitorId||undefined,monitor:{workspaceId},checkedAt:{gte:new Date(Date.now()-days*86400000)}},orderBy:{checkedAt:"asc"}});
 return NextResponse.json(checks);
}
