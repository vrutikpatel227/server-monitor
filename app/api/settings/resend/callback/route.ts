import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {db} from "@/lib/db";
import {getWorkspaceId} from "@/lib/workspace";
import {protect} from "@/lib/provider-crypto";
export async function GET(req:Request){
 const u=new URL(req.url);const code=u.searchParams.get("code");const state=u.searchParams.get("state");const jar=await cookies();const saved=jar.get("sm_resend_state")?.value;const verifier=jar.get("sm_resend_verifier")?.value;const clientId=jar.get("sm_resend_client")?.value;
 if(!code||state!==saved||!verifier||!clientId)return NextResponse.redirect(new URL("/settings?resend=error",u.origin));
 const form=new URLSearchParams({grant_type:"authorization_code",client_id:clientId,redirect_uri:`${u.origin}/api/settings/resend/callback`,code,code_verifier:verifier});
 const token=await fetch("https://api.resend.com/oauth/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:form});if(!token.ok)return NextResponse.redirect(new URL("/settings?resend=error",u.origin));
 const data=await token.json();const workspaceId=await getWorkspaceId();const put=async(key:string,value:string)=>db.setting.upsert({where:{workspaceId_key:{workspaceId,key}},update:{value},create:{workspaceId,key,value}});
 await put("resendAccessToken",protect(String(data.access_token)));await put("resendRefreshToken",protect(String(data.refresh_token)));await put("resendTokenExpiresAt",String(Date.now()+Number(data.expires_in||900)*1000));await put("resendClientId",clientId);await put("emailProvider","resend");await put("resendConnected","true");
 for(const k of ["sm_resend_state","sm_resend_verifier","sm_resend_client"])jar.delete(k);return NextResponse.redirect(new URL("/settings?resend=connected",u.origin));
}
