"use client";
import {useEffect,useState} from "react";
import Shell from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";

export default function Monitors(){
 const [rows,setRows]=useState<any[]>([]);
 const [busy,setBusy]=useState("");
 const [form,setForm]=useState({name:"",url:"",type:"WEBSITE",method:"GET",expectedStatus:200,intervalSeconds:60,timeoutMs:10000});
 const load=()=>fetch("/api/monitors").then(r=>r.json()).then(setRows);
 useEffect(()=>{load()},[]);
 async function add(e:any){
  e.preventDefault();
  const r=await fetch("/api/monitors",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)});
  const x=await r.json();if(!r.ok)return alert(x.error);
  setForm({...form,name:"",url:""});
  await fetch("/api/monitors/test",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:x.id})});
  await load();
 }
 async function remove(id:string,name:string){
  if(!confirm(`Delete monitor "${name}"? This removes its checks and incidents too.`))return;
  setBusy(id);await fetch("/api/monitors?id="+encodeURIComponent(id),{method:"DELETE"});await load();setBusy("");
 }
 return <Shell><div className="p-5 md:p-8 max-w-[1500px] mx-auto">
  <h1 className="text-3xl font-bold">Monitors</h1>
  <p className="muted mt-1 mb-6">Monitor public websites and APIs with real checks, response times and incident history.</p>
  <div className="grid lg:grid-cols-[380px_1fr] gap-5">
   <form onSubmit={add} className="card p-5 space-y-3 h-fit">
    <h2 className="font-semibold">Add Public Monitor</h2>
    <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Monitor name" className="input"/>
    <input required value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="https://example.com" className="input"/>
    <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="input"><option>WEBSITE</option><option>API</option></select>
    <select value={form.method} onChange={e=>setForm({...form,method:e.target.value})} className="input">{["GET","POST","PUT","PATCH","DELETE"].map(x=><option key={x}>{x}</option>)}</select>
    <button className="w-full rounded-lg bg-cyan-400 py-2 font-bold text-black">Save & Test</button>
   </form>
   <div className="card overflow-hidden">
    <div className="p-5 border-b border-[#222630] font-semibold">All public monitors</div>
    <div className="divide-y divide-[#20242d]">{rows.length===0?<div className="p-8 text-center muted text-sm">No public monitors yet.</div>:rows.map(m=>{const c=m.checks?.[0];const code=c?.httpStatus;return <div key={m.id} className="p-5 flex flex-wrap gap-4 items-center justify-between"><div><a href={`/monitors/${m.id}`} className="font-semibold text-cyan-100 hover:text-cyan-300">{m.name}</a><div className="text-xs muted mt-1">{m.method} · {m.url}</div></div><div className="flex items-center gap-4 text-sm"><StatusBadge status={m.status}/><div><div className="font-mono text-xs font-semibold">{code??"—"}{code!=null&&c?.statusName?" · "+c.statusName:""}</div><div className="text-[10px] text-slate-500 max-w-[260px]">{code!=null?(c?.statusExplanation||"HTTP status received"):(c?.failureType?c.failureType.replaceAll("_"," "):"No HTTP response")}</div></div><span className="font-mono text-xs">{c?.responseTimeMs??"—"}{c?.responseTimeMs!=null?" ms":""}</span><button disabled={busy===m.id} onClick={()=>remove(m.id,m.name)} className="rounded-lg border border-red-500/40 text-red-300 px-3 py-1.5">{busy===m.id?"Deleting…":"Delete"}</button></div></div>})}</div>
   </div>
  </div>
  <div className="card mt-5 p-5"><div className="panel-title mb-3">HTTP status meanings</div><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">{[[200,"OK","Request succeeded"],[201,"Created","New resource created"],[204,"No Content","Success, no body"],[301,"Moved Permanently","Permanent redirect"],[302,"Found","Temporary redirect"],[304,"Not Modified","Cached version can be used"],[400,"Bad Request","Request is invalid"],[401,"Unauthorized","Authentication required"],[403,"Forbidden","Access refused"],[404,"Not Found","Resource not found"],[408,"Request Timeout","Request timed out"],[429,"Too Many Requests","Rate limit exceeded"],[500,"Internal Server Error","Server error"],[502,"Bad Gateway","Invalid upstream response"],[503,"Service Unavailable","Server unavailable"],[504,"Gateway Timeout","Upstream timed out"]].map(([code,name,meaning])=><div key={String(code)} className="rounded-lg border border-[#202733] bg-[#090c11] p-3"><div className="font-mono font-bold text-cyan-300">{code} · {name}</div><div className="muted mt-1 leading-4">{meaning}</div></div>)}</div><div className="muted text-xs mt-3">No HTTP response is shown as the actual DNS, TLS, timeout or connection failure.</div></div>
 </div></Shell>
}
