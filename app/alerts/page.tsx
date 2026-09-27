"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";

type Alert={id:string;type:string;message:string;sentAt:string};
export default function AlertsPage(){
 const [items,setItems]=useState<Alert[]>([]);
 useEffect(()=>{fetch("/api/dashboard").then(r=>r.json()).then(d=>setItems(d.alerts??[])).catch(()=>{});},[]);
 return <Shell><div className="space-y-6"><div><h1 className="text-2xl font-bold">Alerts</h1><p className="text-slate-400">Recent notification events and alert history.</p></div>
 <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden"><table className="w-full text-sm"><thead className="border-b border-slate-800 text-left text-slate-400"><tr><th className="p-4">Type</th><th>Message</th><th>Sent</th></tr></thead><tbody>
 {items.map(a=><tr key={a.id} className="border-b border-slate-800/60"><td className="p-4">{a.type}</td><td>{a.message}</td><td>{new Date(a.sentAt).toLocaleString()}</td></tr>)}
 {!items.length&&<tr><td colSpan={3} className="p-8 text-center text-slate-500">No alerts found.</td></tr>}
 </tbody></table></div></div></Shell>;
}