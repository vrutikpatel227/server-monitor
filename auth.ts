import { NextResponse } from "next/server";

const gone = async () => NextResponse.json({ error: "Authentication is disabled. SERVER MONITOR uses anonymous workspaces." }, { status: 404 });

export const handlers = { GET: gone, POST: gone };
export const auth = async () => null;
export const signIn = async () => {};
export const signOut = async () => {};
