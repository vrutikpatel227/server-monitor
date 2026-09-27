import {NextRequest,NextResponse} from "next/server";
import {randomBytes} from "node:crypto";
import {db} from "@/lib/db";
import {getWorkspaceId} from "@/lib/workspace";
import {limited,limitedResponse} from "@/lib/rate-limit";

export async function GET(req:NextRequest){
  const slug=req.nextUrl.searchParams.get("slug");
  if(slug){
    const p=await db.statusPage.findFirst({
      where:{slug,enabled:true},
      include:{monitors:{include:{monitor:{include:{checks:{orderBy:{checkedAt:"desc"},take:1}}}}}}
    });
    if(!p)return NextResponse.json({error:"Status page not found"},{status:404});
    return NextResponse.json({
      name:p.name,slug:p.slug,
      monitors:p.monitors.map(x=>({
        name:x.monitor.name,status:x.monitor.status,
        check:x.monitor.checks[0]?{
          httpStatus:x.monitor.checks[0].httpStatus,
          statusName:x.monitor.checks[0].statusName,
          failureType:x.monitor.checks[0].failureType,
          responseTimeMs:x.monitor.checks[0].responseTimeMs
        }:null
      }))
    });
  }
  const workspaceId=await getWorkspaceId();
  return NextResponse.json(await db.statusPage.findMany({
    where:{workspaceId},
    include:{monitors:{include:{monitor:true}}},
    orderBy:{createdAt:"desc"}
  }));
}export async function POST(req:NextRequest){
  const rl=limited(req,"status-pages:create",10,60000);
  if(!rl.ok)return limitedResponse(rl);
  try{
    const workspaceId=await getWorkspaceId();
    const b=await req.json();
    const name=String(b.name||"").trim();
    if(!name)return NextResponse.json({error:"Name required"},{status:400});
    const slug=(String(b.slug||name).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"status")+"-"+randomBytes(3).toString("hex");
    const ids=Array.isArray(b.monitorIds)?b.monitorIds.map(String):[];
    const valid=await db.monitor.findMany({where:{workspaceId,id:{in:ids}},select:{id:true}});
    const page=await db.statusPage.create({
      data:{workspaceId,name,slug,enabled:b.enabled!==false,monitors:{create:valid.map(m=>({monitorId:m.id}))}}
    });
    return NextResponse.json(page,{status:201});
  }catch(e:any){return NextResponse.json({error:e.message||"Unable to create status page"},{status:400});}
}

export async function PATCH(req:NextRequest){
  const rl=limited(req,"status-pages:update",30,60000);
  if(!rl.ok)return limitedResponse(rl);
  try{
    const workspaceId=await getWorkspaceId();
    const b=await req.json();
    const id=String(b.id||"");
    if(!id)return NextResponse.json({error:"Status page id required"},{status:400});
    const page=await db.statusPage.findFirst({where:{id,workspaceId}});
    if(!page)return NextResponse.json({error:"Status page not found"},{status:404});
    if(Array.isArray(b.monitorIds)){
      const ids=b.monitorIds.map(String);
      const valid=await db.monitor.findMany({where:{workspaceId,id:{in:ids}},select:{id:true}});
      await db.statusPageMonitor.deleteMany({where:{statusPageId:id}});
      if(valid.length)await db.statusPageMonitor.createMany({data:valid.map(m=>({statusPageId:id,monitorId:m.id})),skipDuplicates:true});
    }    if(typeof b.name==="string"&&b.name.trim()){
      await db.statusPage.update({where:{id},data:{name:b.name.trim()}});
    }
    if(typeof b.enabled==="boolean"){
      await db.statusPage.update({where:{id},data:{enabled:b.enabled}});
    }
    return NextResponse.json({ok:true});
  }catch(e:any){return NextResponse.json({error:e.message||"Unable to update status page"},{status:400});}
}

export async function DELETE(req:NextRequest){
  const rl=limited(req,"status-pages:delete",20,60000);
  if(!rl.ok)return limitedResponse(rl);
  try{
    const workspaceId=await getWorkspaceId();
    const b=await req.json();
    const id=String(b.id||"");
    if(!id)return NextResponse.json({error:"Status page id required"},{status:400});
    const page=await db.statusPage.findFirst({where:{id,workspaceId}});
    if(!page)return NextResponse.json({error:"Status page not found"},{status:404});
    await db.statusPage.delete({where:{id}});
    return NextResponse.json({ok:true});
  }catch(e:any){return NextResponse.json({error:e.message||"Unable to delete status page"},{status:400});}
}
