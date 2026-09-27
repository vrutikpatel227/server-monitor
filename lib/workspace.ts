import { cookies } from "next/headers";
import { db } from "./db";

const COOKIE = "sm_workspace";

export async function getWorkspaceId() {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing) {
    const found = await db.workspace.findUnique({ where: { id: existing } });
    if (found) return found.id;
  }
  const workspace = await db.workspace.create({ data: {} });
  jar.set(COOKIE, workspace.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365 * 2,
    path: "/",
  });
  return workspace.id;
}

export async function setWorkspaceCookie(id: string) {
  const jar = await cookies();
  jar.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365 * 2,
    path: "/",
  });
}
