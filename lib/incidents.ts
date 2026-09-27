import {db} from "./db";
import {createAlert} from "./email-alerts";
export async function reconcileIncident(monitorId:string,failed:boolean,data:{title:string;message:string;httpStatus?:number;failureType?:any}){
 const open=await db.incident.findFirst({where:{monitorId,status:"OPEN"}});
 if(failed&&!open){await db.incident.create({data:{monitorId,title:data.title,message:data.message,httpStatus:data.httpStatus,failureType:data.failureType}});await createAlert({type:"DOWN",monitorId,message:`${data.title}: ${data.message}`});}
 if(!failed&&open){await db.incident.update({where:{id:open.id},data:{status:"RESOLVED",resolvedAt:new Date()}});await createAlert({type:"RECOVERED",monitorId,message:`${data.title} recovered`});}
}