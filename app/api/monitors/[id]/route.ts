import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {getWorkspaceId} from "@/lib/workspace";

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const workspaceId=await getWorkspaceId();
 const m=await db.monitor.findFirst({where:{id,workspaceId},include:{checks:{orderBy:{checkedAt:"desc"},take:500},incidents:{orderBy:{startedAt:"desc"},take:50}}});
 if(!m)return NextResponse.json({error:"Monitor not found"},{status:404});return NextResponse.json(m);
}

export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const workspaceId=await getWorkspaceId();
 const monitor=await db.monitor.findFirst({where:{id,workspaceId},select:{id:true}});
 if(!monitor)return NextResponse.json({error:"Monitor not found"},{status:404});
 await db.monitor.delete({where:{id:monitor.id}});
 return NextResponse.json({deleted:true,id:monitor.id});
}
