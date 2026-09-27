import {NextResponse} from "next/server";
export async function POST(){
 return NextResponse.json({error:"A hosted browser cannot start a process on the user's computer. Copy the Agent setup command and run it on the target PC."},{status:410});
}
