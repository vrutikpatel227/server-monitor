"use client";
import {useEffect,useRef,useState} from "react";
import {Activity,ArrowUpRight,Check,ExternalLink,RefreshCw,Send,Trash2,Wifi} from "lucide-react";
import Shell from "@/components/Shell";

type CheckResult={state:"checking"|"ok"|"error"|"cors";status?:number;statusText?:string;responseMs?:number;health?:string;healthStatus?:number;body?:string;message:string;checkedAt?:number};
type History=Record<string,number[]>;
type Service={id:string;name:string;url:string;healthPath:string};
type ApiResult={status?:number;statusText?:string;responseMs?:number;body?:string;error?:string};
type LocalEvent={id:string;serviceId:string;serviceName:string;kind:"down"|"recovered"|"slow";message:string;time:number};

const DB_NAME="server-monitor-local-v2";
const DB_VERSION=1;
const STORE="state";
const INSTANCE_KEY="server-monitor-local-instance-v2";
const defaultService:Service={id:"local-default",name:"Localhost 3001",url:"http://localhost:3001",healthPath:"/api/health"};

function getLocalInstanceId(){
 if(typeof window==="undefined")return "server-render";
 const existing=window.localStorage.getItem(INSTANCE_KEY);
 if(existing)return existing;
 const created=crypto.randomUUID();
 window.localStorage.setItem(INSTANCE_KEY,created);
 return created;
}
function scopedKey(key:string){return `${getLocalInstanceId()}:${key}`; }

function openLocalDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);})}
async function dbGet<T>(key:string,fallback:T):Promise<T>{try{const db=await openLocalDb();return await new Promise<T>((resolve,reject)=>{const req=db.transaction(STORE,"readonly").objectStore(STORE).get(scopedKey(key));req.onsuccess=()=>resolve((req.result??fallback) as T);req.onerror=()=>reject(req.error)})}catch{return fallback}}
async function dbSet(key:string,value:unknown){try{const db=await openLocalDb();await new Promise<void>((resolve,reject)=>{const req=db.transaction(STORE,"readwrite").objectStore(STORE).put(value,scopedKey(key));req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error)})}catch{}}



function validLocal(raw:string){try{const u=new URL(raw);const h=u.hostname.toLowerCase();return ["localhost","127.0.0.1","0.0.0.0","::1"].includes(h)||h.endsWith(".localhost")}catch{return false}}
function getPort(raw:string){try{const u=new URL(raw);return Number(u.port||(u.protocol==="https:"?443:80))}catch{return 0}}
function shortBody(text:string){try{return JSON.stringify(JSON.parse(text),null,2).slice(0,2400)}catch{return text.slice(0,2400)}}
function joinUrl(base:string,path:string){return new URL(path||"/",base.endsWith("/")?base:base+"/").toString()}
export default function LocalMonitor(){
 const [services,setServices]=useState<Service[]>([defaultService]);
 const [results,setResults]=useState<Record<string,CheckResult>>({});
 const [selected,setSelected]=useState("local-default");
 const [auto,setAuto]=useState(true);
 const [seconds,setSeconds]=useState(10);
 const [history,setHistory]=useState<History>({});
 const [name,setName]=useState("");
 const [url,setUrl]=useState("");
 const [healthPath,setHealthPath]=useState("/api/health");
 const [apiMethod,setApiMethod]=useState("GET");
 const [apiPath,setApiPath]=useState("/api/health");
 const [apiBody,setApiBody]=useState("");
 const [apiResult,setApiResult]=useState<ApiResult|null>(null);
 const [apiBusy,setApiBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [events,setEvents]=useState<LocalEvent[]>([]);
 const [emailState,setEmailState]=useState<Record<string,"online"|"offline">>({});
 const [emailMessage,setEmailMessage]=useState("");
 const previousRef=useRef<Record<string,CheckResult>>({});

 const [storageReady,setStorageReady]=useState(false);
 useEffect(()=>{(async()=>{const [savedServices,savedHistory,savedEvents,savedEmailState]=await Promise.all([dbGet<Service[]>("services",[defaultService]),dbGet<History>("history",{}),dbGet<LocalEvent[]>("events",[]),dbGet<Record<string,"online"|"offline">>("emailState",{})]);const serviceList=Array.isArray(savedServices)?savedServices:[defaultService];setServices(serviceList);setSelected(serviceList[0]?.id||"");setHistory(savedHistory);setEvents(savedEvents);setEmailState(savedEmailState||{});setStorageReady(true)})()},[]);
 useEffect(()=>{if(storageReady)void dbSet("services",services)},[services,storageReady]);
 useEffect(()=>{if(storageReady)void dbSet("history",history)},[history,storageReady]);
 useEffect(()=>{if(storageReady)void dbSet("events",events.slice(0,50))},[events,storageReady]);
 useEffect(()=>{if(storageReady)void dbSet("emailState",emailState)},[emailState,storageReady]);

 function addEvent(service:Service,kind:LocalEvent["kind"],msg:string){setEvents(v=>[{id:"evt-"+Date.now()+"-"+Math.random(),serviceId:service.id,serviceName:service.name,kind,message:msg,time:Date.now()},...v].slice(0,50));}
 function notifyEvent(msg:string){if(typeof window!=="undefined"&&"Notification" in window&&Notification.permission==="granted")new Notification("SERVER MONITOR", {body:msg});}
 async function sendEmailEvent(kind:"down"|"online"|"recovered",service:Service,msg:string){try{const r=await fetch("/api/local-monitor/alert",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({kind,serviceName:service.name,url:service.url,message:msg})});const data=await r.json().catch(()=>({}));if(!r.ok){setEmailMessage(`Email alert failed: ${data?.detail||data?.error||data?.reason||"check Settings → Email Alerts"}`);return false}setEmailMessage("Email alert sent.");return true}catch{setEmailMessage("Email alert failed: check Settings → Email Alerts.");return false}}
 async function syncEmailState(service:Service,state:"online"|"offline",msg:string){if(emailState[service.id]===state)return;const kind=state==="offline"?"down":(previousRef.current[service.id]?.state==="error"?"recovered":"online");const sent=await sendEmailEvent(kind,service,msg);if(sent)setEmailState(v=>({...v,[service.id]:state}))}

 async function check(s:Service){
  const previous=previousRef.current[s.id];
  setResults(v=>({...v,[s.id]:{state:"checking",message:"Checking service…"}}));
  const started=performance.now();
  try{
   const r=await fetch(s.url,{cache:"no-store",signal:AbortSignal.timeout(8000)});
   const responseMs=Math.round(performance.now()-started);
   let health="—";let healthStatus:number|undefined;
   if(s.healthPath){
    try{const hr=await fetch(joinUrl(s.url,s.healthPath),{cache:"no-store",signal:AbortSignal.timeout(5000)});healthStatus=hr.status;health=hr.ok?"OK":"ERROR "+hr.status}catch{health="CORS BLOCKED"}
   }
   setHistory(v=>({...v,[s.id]:[...(v[s.id]||[]),responseMs].slice(-30)}));
   if(previous?.state==="error"){const msg=`${s.name} recovered — ${r.status} ${r.statusText||"OK"} in ${responseMs} ms`;addEvent(s,"recovered",msg);notifyEvent(msg);void syncEmailState(s,"online",msg)}
   else {void syncEmailState(s,"online",`${s.name} is ONLINE — ${r.status} ${r.statusText||"OK"} in ${responseMs} ms`)}
   if(responseMs>1000&&(previous?.responseMs==null||previous.responseMs<=1000)){const msg=`${s.name} is slow — ${responseMs} ms response time`;addEvent(s,"slow",msg);notifyEvent(msg)}
   const nextResult={state:r.ok?"ok":"error",status:r.status,statusText:r.statusText||"OK",responseMs,health,healthStatus,checkedAt:Date.now(),message:r.ok?"HTTP request completed successfully.":"HTTP endpoint returned an error."} as CheckResult;
   previousRef.current[s.id]=nextResult;
   setResults(v=>({...v,[s.id]:nextResult}));
  }catch{
   try{
    await fetch(s.url,{mode:"no-cors",cache:"no-store",signal:AbortSignal.timeout(5000)});
    const responseMs=Math.round(performance.now()-started);
    setHistory(v=>({...v,[s.id]:[...(v[s.id]||[]),responseMs].slice(-30)}));
    const nextResult={state:"cors",statusText:"CORS BLOCKED",responseMs,health:s.healthPath?"CORS BLOCKED":"—",message:"Service is reachable, but this page cannot read its HTTP status without CORS.",checkedAt:Date.now()} as CheckResult;previousRef.current[s.id]=nextResult;setResults(v=>({...v,[s.id]:nextResult}));
   }catch{
    const responseMs=Math.round(performance.now()-started);
    setHistory(v=>({...v,[s.id]:[...(v[s.id]||[]),0].slice(-30)}));
    const msg=`${s.name} is DOWN — no response from ${s.url}`;if(previous&&previous.state!=="error"&&previous.state!=="checking"){addEvent(s,"down",msg);notifyEvent(msg)}void syncEmailState(s,"offline",msg)
    const nextResult={state:"error",statusText:"UNREACHABLE",responseMs,health:"—",message:"No response from the local service. Check the app and port.",checkedAt:Date.now()} as CheckResult;previousRef.current[s.id]=nextResult;setResults(v=>({...v,[s.id]:nextResult}));
   }
  }
 }
 async function checkAll(){await Promise.all(services.map(check))}
 useEffect(()=>{if(!storageReady)return;checkAll();if(!auto)return;const t=setInterval(checkAll,seconds*1000);return()=>clearInterval(t)},[auto,seconds,storageReady,services.map(s=>s.id).join(",")]);

 function addService(){
  const n=name.trim();const u=url.trim();
  if(!n||!validLocal(u)){alert("Use a localhost URL such as http://localhost:3001.");return}
  const s:Service={id:"local-"+Date.now(),name:n,url:u,healthPath:healthPath.trim()};
  setServices(v=>[...v,s]);setSelected(s.id);setName("");setUrl("");setHealthPath("/api/health");setTimeout(()=>check(s),0);
 }
 function updateSelectedUrl(value:string){
  if(!current)return;
  setServices(v=>v.map(s=>s.id===current.id?{...s,url:value}:s));
 }
 async function removeService(id:string){
  const next=services.filter(s=>s.id!==id);
  setServices(next);
  setResults(v=>{const x={...v};delete x[id];return x});
  setHistory(v=>{const x={...v};delete x[id];void dbSet("history",x);return x});
  setEvents(v=>{const x=v.filter(e=>e.serviceId!==id);void dbSet("events",x.slice(0,50));return x});
  const nextSelected=next[0]?.id||"";
  setSelected(nextSelected);
  if(storageReady)await dbSet("services",next);
 }
 async function runApiTest(){
  if(!current||!validLocal(current.url)){setMessage("Enter a valid localhost service URL first.");return}
  setApiBusy(true);setApiResult(null);setMessage("");
  const started=performance.now();
  try{
   const init:RequestInit={method:apiMethod,cache:"no-store",signal:AbortSignal.timeout(10000)};
   // Avoid an unnecessary CORS preflight for simple requests. Only send
   // Content-Type when a request actually has a JSON body.
   if(apiMethod!=="GET"&&apiMethod!=="HEAD"&&apiBody.trim()){
    init.headers={"Content-Type":"application/json"};
    init.body=apiBody;
   }
   const r=await fetch(joinUrl(current.url,apiPath),init);
   const responseMs=Math.round(performance.now()-started);
   const body=shortBody(await r.text());
   setApiResult({status:r.status,statusText:r.statusText||"OK",responseMs,body});
  }catch{
   const responseMs=Math.round(performance.now()-started);
   try{await fetch(joinUrl(current.url,apiPath),{mode:"no-cors",cache:"no-store",signal:AbortSignal.timeout(5000)});setApiResult({statusText:"CORS BLOCKED",responseMs,error:"Endpoint is reachable, but the browser cannot read the response without CORS."})}
   catch{setApiResult({statusText:"UNREACHABLE",responseMs,error:"Endpoint could not be reached."})}
  }finally{setApiBusy(false)}
 }
 const current=services.find(s=>s.id===selected)||services[0];
 const result=current?results[current.id]:undefined;
 const httpLabel=result?.status?result.status+" "+(result.statusText||""):result?.statusText||"—";
 const stateLabel=result?.state==="ok"?"ONLINE":result?.state==="cors"?"REACHABLE":result?.state==="checking"?"CHECKING":result?"OFFLINE":"WAITING";
 const historyPoints=current?history[current.id]||[]:[];
 const maxHistory=Math.max(1,...historyPoints);
 return <Shell><div className="p-5 md:p-8 max-w-[1400px] mx-auto">
  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
   <div><div className="section-kicker">Developer tools</div><h1 className="text-3xl font-bold mt-2">Local Development Monitor</h1><p className="muted mt-1">Paste your own localhost URL. The same base URL is used for status, health and API testing.</p></div>
   <a href="/monitors" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[.035]"><ArrowUpRight size={16}/> Public monitors</a>
  </div>

  <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
   <div className="card p-4 h-fit">
    <div className="flex items-center justify-between"><div className="font-semibold">Local services</div><span className="text-xs text-cyan-300">{services.length}</span></div>
    <div className="mt-3 space-y-2">{services.map(s=>{const r=results[s.id];return <div key={s.id} className={`rounded-xl border p-3 transition ${selected===s.id?"border-cyan-400/30 bg-cyan-400/10":"border-[#202733] bg-black/20"}`}><button onClick={()=>setSelected(s.id)} className="w-full text-left"><div className="flex items-center justify-between gap-2"><span className="font-semibold text-sm">{s.name}</span><span className={r?.state==="ok"?"status-up":r?.state==="cors"?"text-amber-300":r?.state==="checking"?"text-slate-400":"status-down"}>● {r?.state==="ok"?"ONLINE":r?.state==="checking"?"CHECKING":r?.state==="cors"?"CORS":r?"OFFLINE":"—"}</span></div><div className="text-[11px] text-slate-500 mt-1 truncate">{s.url}</div></button><button onClick={()=>{if(confirm(`Delete "${s.name}" from Local Monitor?`))removeService(s.id)}} className="mt-2 inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/5"><Trash2 size={13}/> Delete</button></div>})}</div>
    <div className="mt-4 border-t border-[#202733] pt-4 space-y-2"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Service name" className="input"/><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="http://localhost:3001" className="input"/><input value={healthPath} onChange={e=>setHealthPath(e.target.value)} placeholder="/api/health" className="input"/><button onClick={addService} className="w-full rounded-lg border border-cyan-400/30 py-2.5 text-sm font-bold text-cyan-300 hover:bg-cyan-400/10">+ Add Service</button></div>
   </div>

   {current&&<div className="space-y-5">
    <div className="card p-5">
     <div className="text-xs uppercase tracking-[.16em] text-slate-500">Editable local URL</div>
     <div className="mt-2 flex flex-col gap-2 sm:flex-row"><input value={current.url} onChange={e=>updateSelectedUrl(e.target.value)} className="input"/><button onClick={()=>check(current)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-5 py-2 font-bold text-black"><RefreshCw size={15}/> Check</button><a href={current.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300"><ExternalLink size={15}/> Open</a></div>
     <div className="muted text-[11px] mt-2">Change this URL to any localhost address such as http://localhost:3000, http://localhost:3001 or http://127.0.0.1:5000.</div>
    </div>

    <div className="card overflow-hidden">
     <div className="border-b border-[#202733] px-5 py-4 flex items-center justify-between"><div><div className="text-xs uppercase tracking-[.16em] text-slate-500">Service status</div><div className="text-xl font-bold mt-1">{current.name}</div></div><div className={result?.state==="ok"?"status-up":result?.state==="cors"?"text-amber-300":"status-down"}>● {stateLabel}</div></div>
     <div className="grid md:grid-cols-[1fr_1fr] gap-4 p-5">
      <div className={`rounded-2xl border p-6 ${result?.state==="ok"?"border-emerald-400/20 bg-emerald-400/5":result?.state==="cors"?"border-amber-400/20 bg-amber-400/5":"border-rose-400/20 bg-rose-400/5"}`}>
       <div className="text-xs uppercase tracking-[.15em] text-slate-500">HTTP Status</div>
       <div className="mt-3 flex items-baseline gap-3"><div className={`text-5xl font-black ${result?.state==="ok"?"text-emerald-300":result?.state==="cors"?"text-amber-300":"text-rose-300"}`}>{result?.status??"—"}</div><div className="text-lg font-semibold">{result?.statusText||"Waiting"}</div></div>
       <div className="mt-3 text-sm text-slate-400">{result?.message||"Run a check to see the HTTP response."}</div>
       {result?.state==="ok"&&<div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300"><Check size={14}/> HTTP OK</div>}
      </div>
      <div className="grid grid-cols-2 gap-3">
       <div className="rounded-2xl border border-[#202733] bg-black/20 p-5"><div className="muted text-xs">Response</div><div className="text-2xl font-bold mt-2">{result?.responseMs!=null?result.responseMs+" ms":"—"}</div></div>
       <div className="rounded-2xl border border-[#202733] bg-black/20 p-5"><div className="muted text-xs">Port</div><div className="text-xl font-bold mt-2">{getPort(current.url)||"—"}</div><div className="text-xs text-emerald-300 mt-1">{result?.state==="error"&&result?.statusText==="UNREACHABLE"?"OFFLINE":"OPEN / REACHABLE"}</div></div>
       <div className="rounded-2xl border border-[#202733] bg-black/20 p-5"><div className="muted text-xs">Health</div><div className="text-xl font-bold mt-2">{result?.health||"—"}</div><div className="text-xs text-slate-500 mt-1">{result?.healthStatus??""}</div></div>
       <div className="rounded-2xl border border-[#202733] bg-black/20 p-5"><div className="muted text-xs">Last checked</div><div className="text-sm font-semibold mt-2">{result?.checkedAt?new Date(result.checkedAt).toLocaleTimeString():"Never"}</div></div>
      </div>
     </div>
    </div>
    <div className="card overflow-hidden">
     <div className="border-b border-[#202733] px-5 py-4"><div className="flex items-center justify-between"><div><div className="text-xs uppercase tracking-[.16em] text-slate-500">Performance</div><div className="flex items-center gap-2 mt-1"><Activity size={17} className="text-cyan-300"/><div className="text-lg font-bold">Response Time History</div></div></div><span className="text-xs muted">{historyPoints.length} checks</span></div></div>
     <div className="p-5">{historyPoints.length===0?<div className="h-36 grid place-items-center rounded-xl border border-dashed border-[#293241] text-sm muted">Run a check to start the history chart.</div>:<div><div className="flex h-40 items-end gap-1 rounded-xl border border-[#202733] bg-black/20 p-3">{historyPoints.map((v,i)=><div key={i} title={v?v+" ms":"unreachable"} className="flex-1 min-w-1 rounded-t bg-cyan-400/75" style={{height:Math.max(5,v?Math.round((v/maxHistory)*100):5)+"%"}}/>)}</div><div className="mt-3 flex items-center justify-between text-xs muted"><span>Oldest</span><span>Latest · {result?.responseMs!=null?result.responseMs+" ms":"—"}</span></div><div className="mt-2 grid grid-cols-3 gap-2 text-xs"><div className="rounded-lg border border-[#202733] p-3"><div className="muted">Min</div><b>{historyPoints.length?Math.min(...historyPoints.filter(v=>v>0)||[0]):0} ms</b></div><div className="rounded-lg border border-[#202733] p-3"><div className="muted">Max</div><b>{historyPoints.length?Math.max(...historyPoints):0} ms</b></div><div className="rounded-lg border border-[#202733] p-3"><div className="muted">Avg</div><b>{historyPoints.length?Math.round(historyPoints.reduce((a,b)=>a+b,0)/historyPoints.length):0} ms</b></div></div></div>}</div>
    </div>
    <div className="card overflow-hidden">
     <div className="border-b border-[#202733] px-5 py-4"><div className="flex items-center gap-2"><Activity size={17} className="text-cyan-300"/><div className="text-lg font-bold">Local API Tester</div></div><p className="muted text-xs mt-1">The base URL below follows your editable local service URL.</p></div>
     <div className="p-5 space-y-4">
      <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-3"><div className="text-xs text-slate-500">Base URL</div><div className="font-mono text-sm text-cyan-200 mt-1 break-all">{current.url}</div></div>
      <div className="grid grid-cols-[120px_1fr_auto] gap-2"><select value={apiMethod} onChange={e=>setApiMethod(e.target.value)} className="input">{["GET","POST","PUT","PATCH","DELETE"].map(m=><option key={m}>{m}</option>)}</select><input value={apiPath} onChange={e=>setApiPath(e.target.value)} placeholder="/api/health" className="input"/><button onClick={runApiTest} disabled={apiBusy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 font-bold text-black disabled:opacity-60"><Send size={15}/>{apiBusy?"Testing…":"Send"}</button></div>
      {(apiMethod!=="GET"&&apiMethod!=="DELETE")&&<textarea value={apiBody} onChange={e=>setApiBody(e.target.value)} placeholder='Request body JSON, e.g. {"email":"test@example.com"}' className="input min-h-24 font-mono text-xs"/>}
      {apiResult&&<div className={`rounded-xl border p-4 ${apiResult.status&&apiResult.status>=200&&apiResult.status<300?"border-emerald-400/20 bg-emerald-400/5":"border-amber-400/20 bg-amber-400/5"}`}>
       <div className="flex flex-wrap items-center gap-3"><span className="text-xs uppercase tracking-wider text-slate-500">Result</span><b className={apiResult.status&&apiResult.status>=200&&apiResult.status<300?"text-emerald-300":"text-amber-300"}>{apiResult.status??"—"} {apiResult.statusText||""}</b>{apiResult.responseMs!=null&&<span className="text-xs muted">{apiResult.responseMs} ms</span>}</div>
       {apiResult.error&&<div className="mt-2 text-sm text-amber-200">{apiResult.error}</div>}
       {apiResult.body&&<details open className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-cyan-300">Response body</summary><pre className="mt-2 max-h-72 overflow-auto rounded-lg border border-[#202733] bg-black p-3 text-[11px] text-slate-300">{apiResult.body}</pre></details>}
      </div>}
      <div className="rounded-xl border border-[#202733] bg-black/20 p-4"><div className="text-xs uppercase tracking-wider text-slate-500 mb-3">Example tests</div><div className="space-y-2 text-xs"><div className="flex items-center gap-3"><span className="font-mono rounded bg-slate-800 px-2 py-1">GET</span><span>/api/health</span><span className="ml-auto text-emerald-300">200 OK</span></div><div className="flex items-center gap-3"><span className="font-mono rounded bg-slate-800 px-2 py-1">GET</span><span>/api/users</span><span className="ml-auto text-slate-400">200 OK</span></div><div className="flex items-center gap-3"><span className="font-mono rounded bg-slate-800 px-2 py-1">POST</span><span>/api/login</span><span className="ml-auto text-slate-400">401 Unauthorized</span></div></div></div>
     </div>
    </div>

    <div className="card p-5">
     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="panel-title">Automatic checking</div><div className="muted text-xs mt-1">All saved local services are checked while this page is open. ONLINE, OFFLINE and recovery emails use the Resend settings.</div></div><div className="flex items-center gap-3"><label className="text-sm flex items-center gap-2"><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/> Auto</label><select value={seconds} onChange={e=>setSeconds(Number(e.target.value))} className="input !w-auto"><option value={5}>5 sec</option><option value={10}>10 sec</option><option value={30}>30 sec</option><option value={60}>60 sec</option></select></div></div>{emailMessage&&<div className="mt-3 text-xs text-slate-400">{emailMessage}</div>}
    </div>

    {events.filter(e=>e.serviceId===current.id).length>0&&<div className="card overflow-hidden"><div className="border-b border-[#202733] px-5 py-4 flex items-center justify-between"><div><div className="text-xs uppercase tracking-[.16em] text-slate-500">Alerts</div><div className="text-lg font-bold mt-1">Local Event History</div></div><button onClick={()=>setEvents(v=>v.filter(e=>e.serviceId!==current.id))} className="text-xs text-red-300">Clear</button></div><div className="divide-y divide-[#202733]">{events.filter(e=>e.serviceId===current.id).slice(0,10).map(e=><div key={e.id} className="p-4 flex gap-3"><div className={e.kind==="down"?"text-rose-300":e.kind==="recovered"?"text-emerald-300":"text-amber-300"}>{e.kind==="down"?"●":e.kind==="recovered"?"✓":"▲"}</div><div className="flex-1"><div className="text-sm font-semibold">{e.kind==="down"?"Service Down":e.kind==="recovered"?"Service Recovered":"Slow Response"}</div><div className="text-xs muted mt-1">{e.message}</div></div><span className="text-[11px] muted">{new Date(e.time).toLocaleTimeString()}</span></div>)}</div></div>}
   <div className="flex flex-wrap justify-between items-center gap-3"><button onClick={async()=>{if("Notification" in window&&Notification.permission==="default")await Notification.requestPermission()}} className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 px-3 py-2 text-xs font-semibold text-cyan-300">{typeof window!=="undefined"&&"Notification" in window?"Enable browser alerts":"Browser alerts unavailable"}</button><button onClick={()=>removeService(current.id)} className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/5"><Trash2 size={14}/> Remove this service</button></div>
   </div>}
  </div>
 </div></Shell>;
}
