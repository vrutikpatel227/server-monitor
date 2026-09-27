import {NextResponse} from "next/server";
import {sendAlertEmail} from "@/lib/email-alerts";
import {getWorkspaceId} from "@/lib/workspace";
export async function POST(){
 const workspaceId=await getWorkspaceId();
 try{const result=await sendAlertEmail("TEST","This is a test alert from SERVER MONITOR.",undefined,workspaceId);if(result.sent)return NextResponse.json({ok:true,message:"Test email sent successfully. Check your inbox."});return NextResponse.json({ok:false,error:result.reason==="provider_error"?String((result as {detail?:string}).detail||"Resend rejected the email."):"Email test failed: "+(result.reason||"unknown_error"),reason:result.reason},{status:400});}
 catch(error){console.error("test email",error);return NextResponse.json({ok:false,error:"Email test failed. Reconnect Resend and try again."},{status:500});}
}
