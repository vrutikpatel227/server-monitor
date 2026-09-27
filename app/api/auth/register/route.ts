import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Registration is disabled. No login is required." }, { status: 404 });
}
