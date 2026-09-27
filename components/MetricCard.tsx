import {Activity} from "lucide-react";
export default function MetricCard({label,value,sub}:{label:string;value:string|number;sub?:string}){
 return <div className="card card-hover relative overflow-hidden p-5">
  <div className="absolute right-4 top-4 rounded-lg border border-cyan-400/10 bg-cyan-400/5 p-2"><Activity size={15} className="text-cyan-300/70"/></div>
  <div className="section-kicker">{label}</div>
  <div className="mt-3 text-2xl font-bold tracking-tight">{value}</div>
  {sub&&<div className="mt-1 text-xs muted">{sub}</div>}
 </div>;
}