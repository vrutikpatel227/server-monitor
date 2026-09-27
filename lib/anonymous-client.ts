const KEY="anonymous_user_id";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getAnonymousUserId():string|null{try{const id=localStorage.getItem(KEY);return id&&UUID.test(id)?id:null}catch{return null}}
export function clearAnonymousUser():void{try{localStorage.removeItem(KEY)}catch{}}
export async function initializeAnonymousUser():Promise<string|null>{
 let id=getAnonymousUserId();
 try{if(!id){id=crypto.randomUUID();localStorage.setItem(KEY,id)}}catch{}
 try{
  const res=await fetch("/api/anonymous/init",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({anonymousId:id})});
  const data=await res.json().catch(()=>null);
  if(res.ok&&data?.anonymousId){try{localStorage.setItem(KEY,data.anonymousId)}catch{};return data.anonymousId}
 }catch{}
 return id;
}