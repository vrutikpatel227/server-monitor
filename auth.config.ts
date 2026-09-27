import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      if (path === "/login" || path === "/register") return true;
      if (path.startsWith("/api/auth/") || path === "/api/agents/heartbeat") return true;
      if (path.startsWith("/api/")) {
        if (auth?.user) return true;
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "content-type": "application/json" },
        });
      }
      return !!auth?.user;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
