import {NextResponse} from "next/server";
import {sendAlertEmail} from "@/lib/email-alerts";
import {getWorkspaceId} from "@/lib/workspace";

const allowed=new Set(["down","online","recovered"]);

export async function POST(req:Request){
 try{
  const body=await req.json();
  if(!allowed.has(String(body?.kind)))return NextResponse.json({ok:false,error:"Invalid local monitor alert."},{status:400});
  const kind=String(body.kind);
  const serviceName=String(body.serviceName||"Local service").slice(0,160);
  const url=String(body.url||"").slice(0,500);
  const message=String(body.message||"Local service status changed.").slice(0,2000);
  const workspaceId=await getWorkspaceId();
  const type=kind==="down"?"LOCAL SERVICE OFFLINE":kind==="online"?"LOCAL SERVICE ONLINE":"LOCAL SERVICE RECOVERED";
  const detail=`${message}\n\nService: ${serviceName}\nURL: ${url}`;
  const result=await sendAlertEmail(type,detail,undefined,workspaceId);
  if(result.sent)return NextResponse.json({ok:true});
  return NextResponse.json({ok:false,reason:result.reason,detail:"detail" in result?result.detail:undefined},{status:400});
 }catch(error){
  console.error("local monitor alert",error);
  return NextResponse.json({ok:false,error:"Could not send local monitor email alert."},{status:500});
 }
}
