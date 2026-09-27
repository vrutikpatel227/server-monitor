type Bucket={count:number;reset:number};
const buckets=new Map<string,Bucket>();
export function clientKey(req:Request){return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||req.headers.get("x-real-ip")||"unknown";}
export function rateLimit(key:string,limit:number,windowMs:number){const now=Date.now();const old=buckets.get(key);if(!old||old.reset<=now){buckets.set(key,{count:1,reset:now+windowMs});return {ok:true,remaining:limit-1,retryAfter:0};}old.count++;return {ok:old.count<=limit,remaining:Math.max(0,limit-old.count),retryAfter:Math.ceil((old.reset-now)/1000)};}
export function limited(req:Request,scope:string,limit=30,windowMs=60000){return rateLimit(scope+":"+clientKey(req),limit,windowMs);}
export function limitedResponse(result:{ok:boolean;remaining:number;retryAfter:number}){return new Response(JSON.stringify({error:"Too many requests. Please slow down.",retryAfter:result.retryAfter}),{status:429,headers:{"content-type":"application/json","retry-after":String(result.retryAfter),"x-ratelimit-remaining":String(result.remaining)}});}
