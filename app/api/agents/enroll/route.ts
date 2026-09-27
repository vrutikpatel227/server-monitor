import {NextResponse} from "next/server";
import {createHash, randomBytes} from "node:crypto";
import {db} from "@/lib/db";
import {limited, limitedResponse} from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rl = limited(req, "agents:enroll", 20, 60000);
  if (!rl.ok) return limitedResponse(rl);
  try {
    const b = await req.json();
    const agentId = String(b.agentId || "");
    const serverId = String(b.serverId || "");
    const activationToken = String(b.activationToken || "");
    if (!agentId || !serverId || !activationToken) return NextResponse.json({error:"Invalid enrollment request"},{status:400});
    const hash = createHash("sha256").update(activationToken).digest("hex");
    const agent = await db.agent.findFirst({where:{id:agentId,serverId,tokenHash:hash},select:{id:true,serverId:true}});
    if (!agent) return NextResponse.json({error:"Invalid or already used enrollment token"},{status:403});
    const token = randomBytes(32).toString("hex");
    await db.agent.update({where:{id:agent.id},data:{tokenHash:createHash("sha256").update(token).digest("hex")}});
    return NextResponse.json({serverUrl:new URL(req.url).origin,agentId:agent.id,serverId:agent.serverId,token});
  } catch (e:any) {
    return NextResponse.json({error:e?.message||"Enrollment failed"},{status:400});
  }
}
