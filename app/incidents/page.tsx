"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";

type Incident={id:string;status:string;title:string;message:string;startedAt:string;resolvedAt?:string|null;monitor?:{name:string}};
export default function IncidentsPage(){
 const [items,setItems]=useState<Incident[]>([]);
 useEffect(()=>{fetch("/api/dashboard").then(r=>r.json()).then(d=>setItems(d.incidents??[])).catch(()=>{});},[]);
 return <Shell><div className="space-y-6"><div><h1 className="text-2xl font-bold">Incidents</h1><p className="text-slate-400">Monitor failures and recoveries.</p></div>
 <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden"><table className="w-full text-sm"><thead className="border-b border-slate-800 text-left text-slate-400"><tr><th className="p-4">Monitor</th><th>Title</th><th>Started</th><th>Status</th></tr></thead><tbody>
 {items.map(i=><tr key={i.id} className="border-b border-slate-800/60"><td className="p-4">{i.monitor?.name??"—"}</td><td>{i.title}<div className="text-xs text-slate-500">{i.message}</div></td><td>{new Date(i.startedAt).toLocaleString()}</td><td><span className={i.status==="OPEN"?"text-red-400":"text-emerald-400"}>{i.status}</span></td></tr>)}
 {!items.length&&<tr><td colSpan={4} className="p-8 text-center text-slate-500">No incidents found.</td></tr>}
 </tbody></table></div></div></Shell>;
}