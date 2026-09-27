export default function StatusBadge({status}:{status:string}){
 const cls=status==="UP"?"border-emerald-400/20 bg-emerald-400/10 text-emerald-300":status==="DOWN"?"border-rose-400/20 bg-rose-400/10 text-rose-300":status==="DEGRADED"?"border-amber-400/20 bg-amber-400/10 text-amber-300":"border-slate-500/20 bg-slate-500/10 text-slate-400";
 return <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${cls}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{status}</span>;
}