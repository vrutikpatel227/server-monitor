import {spawn,execSync} from "node:child_process";import net from "node:net";
const canConnect=()=>new Promise(r=>{const s=net.connect(5432,"127.0.0.1",()=>{s.destroy();r(true)});s.on("error",()=>r(false))});
if(!(await canConnect())){const p=spawn(process.platform==="win32"?"npm.cmd":"npm",["run","db:start"],{detached:true,stdio:"ignore",shell:process.platform==="win32"});p.unref();for(let i=0;i<30&&!await canConnect();i++)await new Promise(r=>setTimeout(r,1000));}
execSync("npx prisma generate",{stdio:"inherit",shell:true});execSync("npx prisma db push",{stdio:"inherit",shell:true});console.log("SERVER MONITOR database is ready.");
