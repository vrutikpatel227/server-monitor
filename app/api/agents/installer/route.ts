import {NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {db} from "@/lib/db";
import {getWorkspaceId} from "@/lib/workspace";
import {limited,limitedResponse} from "@/lib/rate-limit";
import {readFile} from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rl = limited(req, "agents:installer", 10, 60000);
  if (!rl.ok) return limitedResponse(rl);
  try {
    const workspaceId = await getWorkspaceId();
    const b = await req.json();
    const agentId = String(b.agentId || "");
    const serverId = String(b.serverId || "");
    const token = String(b.token || "");
    if (!agentId || !serverId || !token) return NextResponse.json({error:"agentId, serverId and token required"},{status:400});
    const hash = createHash("sha256").update(token).digest("hex");
    const agent = await db.agent.findFirst({where:{id:agentId,serverId,tokenHash:hash},select:{id:true,serverId:true}});
    if (!agent) return NextResponse.json({error:"Invalid or expired agent credentials"},{status:403});
    const exePath = path.join(process.cwd(), "public", "agent", "server-monitor-agent.exe");
    const exe = await readFile(exePath);
    const metadata = Buffer.from(JSON.stringify({serverUrl:new URL(req.url).origin,serverId,agentId,activationToken:token})).toString("base64url");
    const filename = `SERVER-MONITOR-Agent-${metadata}.exe`;

    return new NextResponse(exe, {status:200,headers:{"content-type":"application/vnd.microsoft.portable-executable","content-disposition":`attachment; filename="${filename}"`,"cache-control":"no-store","content-length":String(exe.length)}});
  } catch(e:any) { return NextResponse.json({error:e?.message||"Unable to build installer"},{status:500}); }
}
