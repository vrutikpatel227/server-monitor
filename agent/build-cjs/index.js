import si from "systeminformation";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const INSTALL_DIR = path.join(process.env.ProgramData || "C:\\ProgramData", "ServerMonitorAgent");
const INSTALLED_EXE = path.join(INSTALL_DIR, "SERVER-MONITOR-Agent-v2.exe");
const TASK_NAME = "SERVER MONITOR Agent";
function readActivation() {
    const args = process.argv.slice(2);
    const getArg = (name) => {
        const i = args.indexOf(name);
        return i >= 0 ? args[i + 1] || "" : "";
    };
    const serverUrl = getArg("--server-url");
    const serverId = getArg("--server-id");
    const agentId = getArg("--agent-id");
    const activationToken = getArg("--activation-token");
    if (serverUrl && serverId && agentId && activationToken)
        return { serverUrl, serverId, agentId, activationToken };
    const name = path.basename(process.execPath);
    const match = name.match(/^SERVER-MONITOR-Agent-([A-Za-z0-9_-]+)(?: \\(\\d+\\))?\\.exe$/i);
    if (!match)
        return null;
    try {
        return JSON.parse(Buffer.from(match[1], "base64url").toString("utf8"));
    }
    catch {
        return null;
    }
}
function enrollActivation() {
    const activation = readActivation();
    if (!activation?.serverUrl || !activation?.agentId || !activation?.serverId || !activation?.activationToken)
        throw new Error("Fresh Agent download is invalid. Download it again from the dashboard.");
    const r = spawnSync("curl.exe", ["-fsS", "-X", "POST", "-H", "content-type: application/json", "--data-raw", JSON.stringify(activation), activation.serverUrl + "/api/agents/enroll"], { encoding: "utf8" });
    if (r.status !== 0)
        throw new Error(r.stderr || "Agent enrollment failed");
    const data = JSON.parse(r.stdout || "{}");
    if (!data.token || !data.agentId)
        throw new Error(data.error || "Agent enrollment failed");
    return data;
}
function ensureStartupInstall() {
    const elevated = process.argv.includes("--elevated-install");
    const task = spawnSync("schtasks.exe", ["/Query", "/TN", TASK_NAME], { stdio: "ignore" });
    if (!elevated && task.status === 0)
        return;
    if (!elevated) {
        const activationArgs = process.argv.slice(2).filter(a => a !== "--elevated-install").map(a => "\"" + a.replace(/\"/g, "\\\"") + "\"").join(" ");
        const ps = `Start-Process -FilePath '${process.execPath.replace(/'/g, "''")}' -ArgumentList '${activationArgs} --elevated-install' -Verb RunAs`;
        spawnSync("powershell.exe", ["-NoProfile", "-Command", ps], { stdio: "inherit" });
        process.exit(0);
    }
    fs.mkdirSync(INSTALL_DIR, { recursive: true });
    const installedConfig = path.join(INSTALL_DIR, "agent.config.json");
    if (!fs.existsSync(installedConfig)) {
        try {
            const data = enrollActivation();
            fs.writeFileSync(installedConfig, JSON.stringify({ serverUrl: data.serverUrl, serverId: data.serverId, agentId: data.agentId, token: data.token }), "utf8");
        }
        catch (e) {
            console.error(e?.message || "Agent enrollment failed.");
            process.exit(1);
        }
    }
    if (process.execPath.toLowerCase() !== INSTALLED_EXE.toLowerCase())
        fs.copyFileSync(process.execPath, INSTALLED_EXE);
    const created = spawnSync("schtasks.exe", ["/Create", "/TN", TASK_NAME, "/TR", `\"${INSTALLED_EXE}\"`, "/SC", "ONSTART", "/RU", "SYSTEM", "/RL", "HIGHEST", "/F"], { stdio: "inherit" });
    if (created.status !== 0) {
        console.error("Could not register Windows startup task.");
        process.exit(1);
    }
    spawnSync("schtasks.exe", ["/Run", "/TN", TASK_NAME], { stdio: "inherit" });
    console.log("SERVER MONITOR Agent installed. It will start automatically with Windows.");
    process.exit(0);
}
ensureStartupInstall();
const appDir = path.dirname(process.execPath);
const configPath = path.join(appDir, "agent.config.json");
let cfg = {};
try {
    cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
}
catch { }
function readEmbeddedConfig() {
    try {
        const stat = fs.statSync(process.execPath);
        const size = Math.min(65536, stat.size);
        const fd = fs.openSync(process.execPath, "r");
        const buf = Buffer.alloc(size);
        fs.readSync(fd, buf, 0, size, stat.size - size);
        fs.closeSync(fd);
        const marker = "SMCFG1:";
        const text = buf.toString("utf8");
        const pos = text.lastIndexOf(marker);
        if (pos < 0)
            return {};
        const encoded = text.slice(pos + marker.length).trim().split(/\s/)[0];
        return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    }
    catch {
        return {};
    }
}
const embedded = readEmbeddedConfig();
if (embedded.serverUrl)
    cfg = embedded;
const API = (process.env.SERVER_MONITOR_URL || cfg.serverUrl || "").replace(/\/$/, "");
const TOKEN = process.env.AGENT_TOKEN || cfg.token || "";
const AGENT_ID = process.env.AGENT_ID || cfg.agentId || "";
const SERVER_ID = process.env.SERVER_ID || cfg.serverId || "";
if (!API || !TOKEN || !AGENT_ID || !SERVER_ID) {
    console.error("SERVER MONITOR Agent is not configured. Missing server URL, server ID, agent ID or token.");
    process.exit(1);
}
async function heartbeat() {
    try {
        const [cpu, mem, fsInfo, net, time, info] = await Promise.all([
            si.currentLoad(), si.mem(), si.fsSize(), si.networkStats(), si.time(), si.osInfo()
        ]);
        const disk = fsInfo[0]?.use ?? 0;
        const networkMbps = ((net[0]?.rx_sec ?? 0) + (net[0]?.tx_sec ?? 0)) * 8 / 1e6;
        const body = {
            agentId: AGENT_ID, serverId: SERVER_ID, version: "1.2.0",
            os: info.platform + " " + info.distro, hostname: os.hostname(),
            metrics: { cpu: cpu.currentLoad, ram: (mem.used / mem.total) * 100, disk, networkMbps, uptimeSeconds: time.uptime }
        };
        const r = await fetch(API + "/api/agents/heartbeat", {
            method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + TOKEN }, body: JSON.stringify(body)
        });
        if (!r.ok)
            console.error("heartbeat failed", r.status, await r.text());
        else
            console.log("heartbeat sent", new Date().toISOString());
    }
    catch (e) {
        console.error("heartbeat error", e);
    }
}
async function localChecks() {
    try {
        const r = await fetch(API + "/api/agents/local-monitors?agentId=" + encodeURIComponent(AGENT_ID), { headers: { authorization: "Bearer " + TOKEN } });
        if (!r.ok)
            return;
        const monitors = await r.json();
        for (const m of monitors) {
            const started = Date.now();
            let code;
            let failureType = "";
            let failureMessage = "";
            let statusName = "";
            let statusExplanation = "";
            try {
                const res = await fetch(m.url, { method: m.method || "GET", headers: m.headers || {}, body: m.method && m.method !== "GET" ? m.requestBody || undefined : undefined, signal: AbortSignal.timeout(m.timeoutMs || 10000), redirect: "manual" });
                code = res.status;
                statusName = res.statusText;
                statusExplanation = res.statusText;
            }
            catch (e) {
                failureType = e?.name === "TimeoutError" ? "TIMEOUT" : "NETWORK";
                failureMessage = e?.message || "Local request failed";
            }
            await fetch(API + "/api/agents/local-check", { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + TOKEN }, body: JSON.stringify({ agentId: AGENT_ID, monitorId: m.id, httpStatus: code, statusName, statusExplanation, responseTimeMs: Date.now() - started, failureType, failureMessage }) });
        }
    }
    catch (e) {
        console.error("local checks", e);
    }
}
async function cycle() { await heartbeat(); await localChecks(); }
cycle();
setInterval(cycle, 30000);
