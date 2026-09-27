"use client";
import {useEffect} from "react";
import {initializeAnonymousUser} from "@/lib/anonymous-client";
export default function AnonymousInitializer(){
 useEffect(()=>{void initializeAnonymousUser()},[]);
 return null;
}