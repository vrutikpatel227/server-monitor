import {NextRequest,NextResponse} from "next/server";
import {db} from "@/lib/db";
import {getWorkspaceId} from "@/lib/workspace";
import {limited,limitedResponse} from "@/lib/rate-limit";
import {randomUUID} from "node:crypto";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req:NextRequest){
 const rl=limited(req,"anonymous:init",20,60000);if(!rl.ok)return limitedResponse(rl);
 try{
  const workspaceId=await getWorkspaceId();
  const body=await req.json().catch(()=>({}));
  const requested=typeof body.anonymousId==="string"&&UUID.test(body.anonymousId)?body.anonymousId:null;
  let requestedId=requested;
  if(requestedId){
   const owner=await db.anonymousUser.findUnique({where:{anonymousId:requestedId},select:{workspaceId:true}});
   if(owner&&owner.workspaceId!==workspaceId)requestedId=null;
  }
  const user=await db.anonymousUser.upsert({
   where:{workspaceId},
   update:{lastSeenAt:new Date()},
   create:{anonymousId:requestedId||randomUUID(),workspaceId}
  });
  return NextResponse.json({anonymousId:user.anonymousId,initialized:true});
 }catch(e){
  return NextResponse.json({error:"Anonymous identity initialization failed. Please continue; a new workspace can be created automatically."},{status:503});
 }
}