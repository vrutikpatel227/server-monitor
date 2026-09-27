import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import crypto from "crypto";
const b64=(b:Buffer)=>b.toString("base64url");
export async function GET(req:Request){
 const origin=new URL(req.url).origin; const redirectUri=`${origin}/api/settings/resend/callback`;
 const verifier=b64(crypto.randomBytes(64)); const challenge=b64(crypto.createHash("sha256").update(verifier).digest()); const state=b64(crypto.randomBytes(24));
 const reg=await fetch("https://api.resend.com/oauth/register",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({client_name:"SERVER MONITOR",redirect_uris:[redirectUri],grant_types:["authorization_code","refresh_token"],response_types:["code"],token_endpoint_auth_method:"none",scope:"emails:send"})});
 if(!reg.ok)return NextResponse.json({error:"Could not register SERVER MONITOR with Resend."},{status:502});
 const data=await reg.json(); const clientId=String(data.client_id||""); if(!clientId)return NextResponse.json({error:"Resend did not return a client ID."},{status:502});
 const jar=await cookies(); const opts={httpOnly:true as const,sameSite:"lax" as const,secure:process.env.NODE_ENV==="production",maxAge:600,path:"/"};
 jar.set("sm_resend_state",state,opts);jar.set("sm_resend_verifier",verifier,opts);jar.set("sm_resend_client",clientId,opts);
 const auth=new URL("https://api.resend.com/oauth/authorize"); for(const [k,v] of Object.entries({response_type:"code",client_id:clientId,redirect_uri:redirectUri,scope:"emails:send",state,code_challenge_method:"S256",code_challenge:challenge}))auth.searchParams.set(k,v);
 return NextResponse.redirect(auth.toString());
}
