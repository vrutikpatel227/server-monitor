import {NextRequest,NextResponse} from "next/server";
import {db} from "@/lib/db";
import {getWorkspaceId} from "@/lib/workspace";
const FIXED_FROM="onboarding@resend.dev";
const FIXED_NAME="SERVER MONITOR";
export async function GET(){const workspaceId=await getWorkspaceId();const rows=await db.setting.findMany({where:{workspaceId}});const map=Object.fromEntries(rows.map(x=>[x.key,x.value]));return NextResponse.json({email:map.email??"",emailAlerts:map.emailAlerts??"true",provider:"resend",fromEmail:FIXED_FROM,fromName:FIXED_NAME,connected:map.resendConnected==="true"});}
export async function POST(req:NextRequest){const workspaceId=await getWorkspaceId();const body=await req.json();const email=String(body.email??"").trim();if(email&&!/^\S+@\S+\.\S+$/.test(email))return NextResponse.json({error:"Enter a valid alert email."},{status:400});const values={email,emailAlerts:String(body.emailAlerts!==false),emailProvider:"resend",resendFromEmail:FIXED_FROM,resendFromName:FIXED_NAME};for(const [key,value] of Object.entries(values))await db.setting.upsert({where:{workspaceId_key:{workspaceId,key}},update:{value},create:{workspaceId,key,value}});return NextResponse.json({ok:true});}
