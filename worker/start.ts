import {runOnce} from "./index";
async function main(){console.log("SERVER MONITOR worker started");while(true){try{await runOnce();}catch(e){console.error("worker cycle",e);}await new Promise(r=>setTimeout(r,Number(process.env.MONITOR_INTERVAL_MS||60000)));}}
void main();
