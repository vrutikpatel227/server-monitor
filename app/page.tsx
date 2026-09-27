import Link from "next/link";
import {Activity,ArrowRight,CheckCircle2,Globe2,ShieldCheck,Zap,Clock3,BarChart3,Mail,Database,HardDrive,Server,Wifi,Code2,BellRing,ExternalLink,LockKeyhole,Laptop} from "lucide-react";

const coreFeatures=[
 [Globe2,"Public Monitoring","Monitor websites and APIs from the internet with real HTTP checks, status codes and response times."],
 [HardDrive,"Local Monitoring","Check services running on your own computer directly from your browser while developing and testing."],
 [Mail,"Email Alerts","Get notified when a monitored service goes down or recovers, so you can act quickly."]
] as const;

const features=[
 [Globe2,"Website & API Monitoring","Monitor HTTP/HTTPS endpoints for availability, status codes, response time, DNS, TLS and timeouts."],
 [Wifi,"Response Time & Uptime","Track performance over time and see recent checks, failures and availability trends."],
 [BellRing,"Incident Detection","Automatically detect outages, create incidents and resolve them when the service recovers."],
 [ShieldCheck,"SSL Monitoring","Check HTTPS certificates and surface supported expiry warnings before they become a problem."],
 [BarChart3,"History & Insights","Keep monitor check history and inspect response-time and failure patterns."],
 [Server,"Public Status Pages","Give users a clean public view of selected services and their current operational state."]
] as const;

function StatusDot({color="green"}:{color?:string}){return <span className={`status-pulse inline-block h-2.5 w-2.5 rounded-full ${color==="red"?"bg-rose-400":"bg-emerald-400"}`}/>}

function HeroMonitor(){
 return <div className="public-visual relative mx-auto w-full max-w-[560px] overflow-hidden rounded-3xl border border-cyan-400/15 bg-[#080d14] p-4 shadow-[0_25px_80px_#0009]">
  <div className="absolute inset-0 public-grid opacity-50"/>
  <div className="relative">
   <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-black/25 px-3 py-2"><Globe2 size={14} className="text-cyan-300"/><span className="font-mono text-[9px] text-slate-400">https://api.yourservice.com</span><span className="ml-auto rounded-md bg-emerald-400/10 px-2 py-1 text-[8px] font-bold text-emerald-300">HTTPS</span></div>
   <div className="relative mt-4 h-[285px] overflow-hidden rounded-2xl border border-slate-800/80 bg-[#06090e]">
    <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/15 bg-cyan-400/[.04] shadow-[0_0_70px_#22d3ee10]"/>
    <div className="public-ring public-ring-a"/><div className="public-ring public-ring-b"/>
    <div className="server-3d-wrap absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
     <div className="server-3d">
      <div className="server-3d-face server-3d-front">
       <div className="server-3d-screen">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/10 bg-cyan-400/10 shadow-[0_0_24px_#22d3ee12]"><Activity className="text-cyan-300" size={21}/></div>
        <div className="mt-2 text-[10px] font-black tracking-tight text-white">SERVER MONITOR</div>
        <div className="mt-1 text-[8px] text-slate-500">Checking endpoint</div>
       </div>
       <div className="server-leds"><i/><i/><i/></div>
      </div>
      <div className="server-3d-face server-3d-right"><span/><span/><span/><span/></div>
      <div className="server-3d-face server-3d-top"/>
      <div className="server-3d-base"/>
     </div>
    </div>
    <div className="public-node public-node-a"><StatusDot/><span>Website</span><b>200 OK</b></div>
    <div className="public-node public-node-b"><StatusDot/><span>API</span><b>200 OK</b></div>
    <div className="public-node public-node-c"><StatusDot/><span>SSL</span><b>Valid</b></div>
    <div className="request-beam beam-a"/><div className="request-beam beam-b"/><div className="request-beam beam-c"/>
    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-slate-800 bg-black/35 px-3 py-2"><div className="flex items-center gap-2 text-[8px] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/> LIVE CHECK</div><div className="font-mono text-[8px] text-cyan-300">184 ms · 200 OK</div></div>
   </div>
   <div className="mt-3 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl border border-slate-800 bg-white/[.025] p-2"><div className="text-[8px] text-slate-500">UPTIME</div><div className="mt-1 text-xs font-bold text-emerald-300">99.98%</div></div><div className="rounded-xl border border-slate-800 bg-white/[.025] p-2"><div className="text-[8px] text-slate-500">RESPONSE</div><div className="mt-1 font-mono text-xs font-bold text-cyan-300">184ms</div></div><div className="rounded-xl border border-slate-800 bg-white/[.025] p-2"><div className="text-[8px] text-slate-500">STATUS</div><div className="mt-1 text-xs font-bold text-emerald-300">ONLINE</div></div></div>
  </div>
 </div>
}

function LocalVisual(){
 return <div className="local-visual relative mx-auto max-w-[620px] overflow-hidden rounded-3xl border border-violet-400/15 bg-[#090c13] p-4 shadow-[0_25px_80px_#0009]">
  <div className="absolute inset-0 local-grid opacity-40"/>
  <div className="relative rounded-2xl border border-slate-800 bg-[#070a0f] p-4">
   <div className="flex items-center gap-2 border-b border-white/[.06] pb-3"><Code2 size={14} className="text-violet-300"/><span className="font-mono text-[9px] text-slate-400">LOCAL DEVELOPMENT</span><span className="ml-auto rounded-full bg-violet-400/10 px-2 py-1 text-[8px] text-violet-300">PRIVATE</span></div>
   <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.1fr]">
    <div className="rounded-xl border border-slate-800 bg-black/25 p-4"><div className="flex items-center gap-2 text-[9px] font-semibold text-slate-300"><Laptop size={14} className="text-violet-300"/> Your computer</div><div className="mt-4 space-y-3">
     {[["Frontend","localhost:3000","24 ms"],["API Server","localhost:8000","18 ms"],["Dev Tool","localhost:5173","31 ms"]].map(([n,u,t],i)=><div key={n} className="local-service flex items-center gap-3"><div className="relative"><span className="local-signal"/><span className="relative z-10 block h-2.5 w-2.5 rounded-full bg-emerald-400"/></div><div className="min-w-0 flex-1"><div className="text-[9px] font-semibold">{n}</div><div className="font-mono text-[8px] text-slate-500">{u}</div></div><span className="font-mono text-[8px] text-cyan-300">{t}</span></div>)}
    </div></div>
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-black/25 p-4"><div className="text-[9px] font-semibold text-slate-300">Browser check</div><div className="mt-3 rounded-lg border border-slate-800 bg-[#090d13] p-3 font-mono text-[8px] leading-5"><div><span className="text-violet-300">GET</span> <span className="text-slate-400">http://localhost:3000</span></div><div className="text-emerald-300">✓ 200 OK</div><div className="text-slate-500">response: 24ms</div><div className="text-slate-500">port: reachable</div></div><div className="local-scan absolute left-3 right-3 top-0 h-px bg-violet-300/60 shadow-[0_0_14px_#a78bfa]"/></div>
   </div>
   <div className="mt-4 flex items-center justify-between rounded-xl border border-violet-400/10 bg-violet-400/[.035] px-3 py-2.5"><div className="flex items-center gap-2 text-[8px] text-slate-400"><Wifi size={13} className="text-violet-300"/> Runs directly in your browser</div><div className="font-mono text-[8px] text-violet-300">NO PUBLIC EXPOSURE</div></div>
  </div>
 </div>
}

export default function Home(){ return <main className="min-h-screen overflow-hidden bg-[#07090d] text-slate-100">
  <header className="sticky top-0 z-30 border-b border-white/[.06] bg-[#07090d]/85 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
   <Link href="/" className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10"><Activity className="text-cyan-300" size={21}/></div><div><div className="font-extrabold tracking-wide">SERVER MONITOR</div><div className="text-[10px] uppercase tracking-[.2em] text-slate-500">Website · API · Local Monitoring</div></div></Link>
   <nav className="hidden items-center gap-7 text-sm text-slate-400 md:flex"><a href="#features" className="hover:text-white">Features</a><a href="#how" className="hover:text-white">How it works</a><a href="#alerts" className="hover:text-white">Alerts</a><Link href="/about" className="hover:text-white">About</Link></nav>
  </div></header>

  <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-14 lg:grid-cols-[1fr_1fr] lg:pt-20">
   <div className="hero-grid absolute inset-0 -z-0 opacity-40"/>
   <div className="relative z-10">
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[.06] px-3 py-1.5 text-xs font-semibold text-cyan-300"><Zap size={13}/> Real monitoring · Clear alerts</div>
    <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-[-.045em] sm:text-6xl">Monitor your websites,<br/><span className="text-cyan-300">APIs & local services.</span></h1>
    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">SERVER MONITOR checks your public websites and APIs, while Local Monitor checks services running on your own computer. Track uptime, response time and incidents — and get email alerts when something changes.</p>
    <div className="mt-8 flex flex-wrap gap-3"><Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 font-bold text-white shadow-[0_0_30px_#22d3ee30] transition hover:bg-cyan-400">Start Monitoring <ArrowRight size={17}/></Link><Link href="/local-monitor" className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[.04] px-6 py-3.5 font-bold text-cyan-200 transition hover:bg-cyan-400/10">Try Local Monitor <Code2 size={17}/></Link></div>
    <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500"><span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400"/> No login required</span><span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400"/> Real checks</span><span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400"/> Email alerts</span></div>
   </div>
   <div className="relative z-10"><HeroMonitor/></div>
  </section>

  <section className="mx-auto max-w-7xl px-5 pb-20"><div className="grid gap-4 md:grid-cols-3">{coreFeatures.map(([Icon,title,desc])=><div key={title} className="home-card card p-6"><div className="icon-float grid h-12 w-12 place-items-center rounded-xl bg-cyan-400/10"><Icon size={21} className="text-cyan-300"/></div><h2 className="mt-5 text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p></div>)}</div></section>

  <section className="border-y border-white/[.05] bg-[#090d13]"><div className="mx-auto max-w-7xl px-5 py-20">
   <div className="grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr]"><div><div className="section-kicker">Local development</div><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Test your localhost without exposing it.</h2><p className="mt-4 max-w-xl leading-7 text-slate-400">Local Monitor checks services running on your computer directly from the browser. See whether a port responds, measure response time and test your local APIs while you build.</p><div className="mt-7 space-y-3 text-sm text-slate-400"><div className="flex gap-3"><Wifi className="mt-0.5 shrink-0 text-violet-300" size={18}/><span><b className="text-slate-200">Port reachability</b> — instantly see whether your local service is responding.</span></div><div className="flex gap-3"><Clock3 className="mt-0.5 shrink-0 text-violet-300" size={18}/><span><b className="text-slate-200">Response time</b> — measure how quickly your localhost service responds.</span></div><div className="flex gap-3"><Code2 className="mt-0.5 shrink-0 text-violet-300" size={18}/><span><b className="text-slate-200">API testing</b> — test GET, POST, PUT, PATCH and DELETE requests while developing.</span></div></div></div><LocalVisual/></div>
  </div></section>  <section id="features" className="mx-auto max-w-7xl px-5 py-20"><div className="max-w-2xl"><div className="section-kicker">Core features</div><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Everything you need to understand service health.</h2><p className="mt-4 text-slate-400">Real monitoring, useful history and actionable alerts — without an AI-first dashboard or fake data.</p></div>
   <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{features.map(([Icon,title,desc])=><div key={title} className="home-card card p-6"><div className="icon-float grid h-11 w-11 place-items-center rounded-xl bg-cyan-400/10"><Icon size={20} className="text-cyan-300"/></div><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p></div>)}</div>
  </section>

  <section id="how" className="border-y border-white/[.05] bg-[#090d13]"><div className="mx-auto max-w-7xl px-5 py-20">
   <div className="text-center"><div className="section-kicker">How it works</div><h2 className="mt-3 text-3xl font-bold sm:text-4xl">From URL to live status in four steps.</h2><p className="mx-auto mt-4 max-w-2xl text-slate-400">Public monitors run in the background. Local checks run directly in your browser.</p></div>
   <div className="how-flow relative mt-12 grid gap-4 md:grid-cols-4">{[
    {n:"01",t:"Add a target",d:"Add a website or API URL, or open Local Monitor for a service on your PC.",Icon:Globe2},
    {n:"02",t:"Run real checks",d:"The monitor sends a real check and measures status, reachability and response time.",Icon:Activity},
    {n:"03",t:"Track the result",d:"Status, performance and incidents are recorded so you can see what changed.",Icon:BarChart3},
    {n:"04",t:"Get alerted",d:"If a monitored service goes down or recovers, configured email alerts notify you.",Icon:Mail}
   ].map(({n,t,d,Icon:StepIcon})=><div key={n} className="step-card how-step home-card card relative overflow-hidden p-6"><div className="how-step-line"/><div className="relative z-10 flex items-center justify-between"><div className="step-number grid h-11 w-11 place-items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 font-mono text-sm font-bold text-cyan-300">{n}</div><StepIcon className="step-icon text-slate-600" size={22}/></div><div className="relative z-10 mt-5 h-12 rounded-xl border border-slate-800 bg-black/20 p-2"><div className="how-mini-bar"/><div className="mt-1 font-mono text-[8px] text-slate-500">{n==="01"?"URL / localhost":n==="02"?"200 OK · 184 ms":n==="03"?"UPTIME · HISTORY":"EMAIL · RECOVERED"}</div></div><h3 className="relative z-10 mt-5 font-bold">{t}</h3><p className="relative z-10 mt-2 text-sm leading-6 text-slate-400">{d}</p></div>)}</div>
   <div className="how-route mt-10"><span className="how-route-progress"/><div><b>ADD</b><small>Target</small></div><i>→</i><div><b>CHECK</b><small>Real request</small></div><i>→</i><div><b>TRACK</b><small>History</small></div><i>→</i><div><b>ALERT</b><small>Email</small></div></div>
  </div></section>

  <section id="alerts" className="mx-auto max-w-7xl px-5 py-20"><div className="relative overflow-hidden rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[.08] via-[#0d141d] to-[#0a0d13] p-7 sm:p-10">
   <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/[.06] blur-3xl"/>
   <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_.8fr]"><div><div className="flex items-center gap-2 text-sm font-semibold text-cyan-300"><Mail className="mail-ring" size={18}/> Email alerts when something changes</div><h2 className="mt-4 text-3xl font-black sm:text-4xl">Know before your users tell you.</h2><p className="mt-4 max-w-2xl leading-7 text-slate-400">Configure an email recipient and receive supported notifications when a public monitor goes down or recovers, with additional supported alert conditions such as SSL expiry warnings.</p><Link href="/settings" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-bold text-white hover:bg-cyan-400">Configure Email Alerts <ArrowRight size={16}/></Link></div>
    <div className="relative rounded-2xl border border-slate-800 bg-black/20 p-5"><div className="text-xs font-bold">Alert delivery</div><div className="relative mt-5 h-28"><div className="absolute left-0 right-0 top-1/2 h-px bg-slate-800"/><div className="packet absolute top-[calc(50%-3px)] h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#22d3ee]"/><div className="packet absolute top-[calc(50%-3px)] h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#22d3ee]"/><div className="packet absolute top-[calc(50%-3px)] h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#22d3ee]"/><div className="absolute left-0 top-1/2 -translate-y-1/2 rounded-xl border border-rose-400/15 bg-rose-400/5 p-3"><Activity size={18} className="text-rose-300"/></div><div className="absolute right-0 top-1/2 -translate-y-1/2 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-3"><Mail size={18} className="text-emerald-300"/></div></div><div className="flex justify-between text-[9px] text-slate-500"><span>Monitor event</span><span>Email delivered</span></div></div>
   </div>
  </div></section>  <section className="mx-auto max-w-7xl px-5 py-20"><div className="grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
   <div><div className="section-kicker">Privacy & data</div><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Your monitoring data has a clear path.</h2><p className="mt-4 max-w-xl leading-7 text-slate-400">You can start without creating a login. Your browser identity connects to an isolated workspace where public monitor data and history are stored.</p><div className="mt-6 space-y-3 text-sm text-slate-400"><div className="flex gap-3"><LockKeyhole className="mt-0.5 shrink-0 text-emerald-300" size={18}/><span><b className="text-slate-200">No account required:</b> a random browser identity is used to restore your workspace.</span></div><div className="flex gap-3"><Database className="mt-0.5 shrink-0 text-cyan-300" size={18}/><span><b className="text-slate-200">Persistent monitoring:</b> public monitors, checks, incidents, alerts and settings are stored server-side.</span></div><div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-violet-300" size={18}/><span><b className="text-slate-200">Protected services:</b> URL validation, rate limiting and protected provider secrets are part of the platform.</span></div></div></div>
   <div className="card relative overflow-hidden p-5 sm:p-8"><div className="absolute inset-0 data-grid opacity-30"/><div className="relative flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
    <div className="storage-node"><div className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10"><HardDrive className="text-cyan-300" size={25}/></div><div className="mt-2 text-center text-[11px] font-semibold">Your Browser</div><div className="text-center text-[10px] text-slate-500">Anonymous ID</div></div>
    <div className="storage-flow hidden sm:block"><span/><span/><span/></div>
    <div className="storage-node"><div className="grid h-14 w-14 place-items-center rounded-2xl border border-violet-400/20 bg-violet-400/10"><Activity className="text-violet-300" size={25}/></div><div className="mt-2 text-center text-[11px] font-semibold">Workspace</div><div className="text-center text-[10px] text-slate-500">Isolated data</div></div>
    <div className="storage-flow hidden sm:block"><span/><span/><span/></div>
    <div className="storage-node"><div className="grid h-14 w-14 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10"><Database className="text-emerald-300" size={25}/></div><div className="mt-2 text-center text-[11px] font-semibold">PostgreSQL</div><div className="text-center text-[10px] text-slate-500">Monitor history</div></div>
   </div><div className="relative mt-7 rounded-xl border border-slate-800 bg-black/20 p-3 text-center text-xs text-slate-500">Browser identity → isolated workspace → persistent monitoring data</div></div>
  </div></section>

  <section className="mx-auto max-w-7xl px-5 pb-20"><div className="card overflow-hidden p-7 text-center sm:p-10"><div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-cyan-400/10"><Activity className="text-cyan-300" size={22}/></div><div className="section-kicker mt-5">Ready when you are</div><h2 className="mt-3 text-3xl font-black sm:text-4xl">Start monitoring your services today.</h2><p className="mx-auto mt-4 max-w-2xl text-slate-400">Monitor public endpoints, test local services and get notified when something goes wrong.</p><Link href="/dashboard" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 font-bold text-white shadow-[0_0_30px_#22d3ee25] hover:bg-cyan-400">Start Monitoring <ArrowRight size={17}/></Link></div></section>

  <footer className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/[.05] px-5 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><div>© 2026 SERVER MONITOR · Created by Vrutik Patel</div><div className="flex flex-wrap gap-5"><Link href="/about" className="hover:text-white">About</Link><Link href="/dashboard" className="hover:text-white">Dashboard</Link><Link href="/local-monitor" className="hover:text-white">Local Monitor</Link><Link href="/status-page" className="hover:text-white">Status Pages</Link></div></footer>
 </main>
}