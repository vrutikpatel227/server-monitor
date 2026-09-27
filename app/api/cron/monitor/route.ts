import {NextResponse} from "next/server";
import {runOnce} from "@/worker/index";
export const dynamic="force-dynamic";
export async function GET(req:Request){
 const secret=process.env.CRON_SECRET;const auth=req.headers.get("authorization");
 if(secret&&auth!==`Bearer ${secret}`)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{return NextResponse.json({ok:true,...await runOnce()});}
 catch(e:any){console.error("cron monitor",e);return NextResponse.json({error:e?.message||"Monitor cycle failed"},{status:500});}
}
