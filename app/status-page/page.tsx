"use client";
import {useEffect,useState} from "react";
import Shell from "@/components/Shell";

type Monitor={id:string;name:string;url:string;status?:string};
type Page={id:string;name:string;slug:string;enabled:boolean;monitors:{monitorId:string}[]};

export default function StatusPages(){
  const [rows,setRows]=useState<Page[]>([]);
  const [monitors,setMonitors]=useState<Monitor[]>([]);
  const [name,setName]=useState("My Status Page");
  const [url,setUrl]=useState("");
  const [selected,setSelected]=useState<string[]>([]);
  const [loading,setLoading]=useState(true);
  const [adding,setAdding]=useState(false);

  async function load(){
    setLoading(true);
    const [a,b]=await Promise.all([
      fetch("/api/status-pages").then(r=>r.json()),
      fetch("/api/monitors").then(r=>r.json())
    ]);
    setRows(Array.isArray(a)?a:[]);
    setMonitors(Array.isArray(b)?b:[]);
    setLoading(false);
  }

  useEffect(()=>{load()},[]);

  async function addWebsite(){
    const target=url.trim();
    if(!target)return alert("Website URL required");
    try{new URL(target)}catch{return alert("Enter a valid URL, e.g. https://example.com")}
    setAdding(true);
    try{
      const u=new URL(target);
      const r=await fetch("/api/monitors",{method:"POST",headers:{"content-type":"application/json"},
        body:JSON.stringify({name:u.hostname,url:target,type:"WEBSITE",method:"GET"})});
      const x=await r.json();
      if(!r.ok)throw new Error(x.error||"Unable to add website");
      setUrl("");
      setSelected(s=>[...s,x.id]);
      await fetch("/api/monitors/test",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:x.id})});
      await load();
    }catch(e:any){alert(e.message||"Unable to add website")}finally{setAdding(false)}
  }

  async function create(){
    if(!name.trim())return alert("Status page name required");
    if(!selected.length)return alert("Select at least one monitor");
    const r=await fetch("/api/status-pages",{method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({name,monitorIds:selected})});
    if(r.ok){setName("My Status Page");setSelected([]);await load();}
    else alert((await r.json()).error||"Unable to create status page");
  }

  function toggle(id:string){setSelected(x=>x.includes(id)?x.filter(v=>v!==id):[...x,id]);}
  async function save(id:string,monitorIds:string[]){
    const r=await fetch("/api/status-pages",{method:"PATCH",headers:{"content-type":"application/json"},
      body:JSON.stringify({id,monitorIds})});
    if(r.ok)await load();else alert((await r.json()).error||"Unable to save monitors");
  }

  async function remove(id:string){
    if(!confirm("Delete this status page? This cannot be undone."))return;
    const r=await fetch("/api/status-pages",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({id})});
    if(r.ok)await load();else alert((await r.json()).error||"Unable to delete status page");
  }

  return <Shell><div className="w-full max-w-5xl mx-auto space-y-5 p-3 sm:p-5 md:p-8">
    <div><h1 className="text-3xl font-bold">Status Pages</h1><p className="muted mt-1">Add a website, select it, and publish its live status.</p></div>

    <div className="card p-5 space-y-4">
      <div className="flex gap-3">
        <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Status page name"/>
        <button onClick={create} className="w-full rounded-lg bg-cyan-400 px-5 py-3 font-bold text-black sm:w-auto">Create</button>
      </div>
      <div className="flex gap-3">
        <input className="input" value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addWebsite()}} placeholder="Paste website URL: https://example.com"/>
        <button onClick={addWebsite} disabled={adding} className="w-full rounded-lg border border-cyan-500/50 px-5 py-3 font-bold whitespace-nowrap text-cyan-300 sm:w-auto">{adding?"Adding…":"Add Website"}</button>
      </div>
      <div><div className="section-kicker mb-2">Select monitors for the new status page</div>
        {monitors.length?<div className="grid gap-2 sm:grid-cols-2">{monitors.map(m=><label key={m.id} className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={selected.includes(m.id)} onChange={()=>toggle(m.id)}/><span>{m.name}</span><span className="muted truncate">({m.url})</span>
        </label>)}</div>:<div className="muted text-sm">Paste a website URL above to add your first monitor.</div>}
      </div>
    </div>

    {loading?<div className="card p-8 text-center muted">Loading status pages...</div>:<div className="space-y-3">
      {rows.map(p=><PageCard key={p.id} page={p} monitors={monitors} onSave={save} onDelete={remove}/>)}
      {!rows.length&&<div className="card p-8 text-center muted">No status pages yet. Add a website above and create one.</div>}
    </div>}
  </div></Shell>;
}

function PageCard({page,monitors,onSave,onDelete}:{page:Page;monitors:Monitor[];onSave:(id:string,ids:string[])=>void;onDelete:(id:string)=>void}){
  const [ids,setIds]=useState<string[]>(page.monitors?.map(x=>x.monitorId)||[]);
  useEffect(()=>setIds(page.monitors?.map(x=>x.monitorId)||[]),[page]);
  return <div className="card p-5">
    <div className="flex flex-wrap justify-between gap-3">
      <div><b>{page.name}</b><div className="muted text-xs mt-1">Slug: {page.slug} · {page.enabled?"Enabled":"Disabled"}</div></div>
      <div className="flex gap-4"><a className="text-cyan-300 text-sm" target="_blank" href={"/status?slug="+encodeURIComponent(page.slug)}>Open public page →</a><button onClick={()=>onDelete(page.id)} className="text-rose-300 text-sm">Delete</button></div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="section-kicker">Visible monitors</div>
      {monitors.length?monitors.map(m=><label key={m.id} className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={ids.includes(m.id)} onChange={()=>setIds(x=>x.includes(m.id)?x.filter(v=>v!==m.id):[...x,m.id])}/><span>{m.name}</span><span className="muted truncate">({m.url})</span>
      </label>):<div className="muted text-sm">No monitors.</div>}
    </div>
    <div className="mt-4 flex gap-2">
      <button onClick={()=>onSave(page.id,ids)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm">Save monitors</button>
      <a target="_blank" href={"/status?slug="+encodeURIComponent(page.slug)} className="rounded-lg border border-cyan-900 px-4 py-2 text-sm text-cyan-300">View status</a>
    </div>
  </div>;
}
