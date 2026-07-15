export default async (request, context) => {
  const validUser = Deno.env.get("DEALS_AUTH_USER") || "vmps";
  const validPass = Deno.env.get("DEALS_AUTH_PASSWORD");

  const auth = request.headers.get("authorization");
  if (auth && auth.startsWith("Basic ")) {
    const decoded = atob(auth.slice(6));
    const sep = decoded.indexOf(":");
    const user = decoded.slice(0, sep);
    const pass = decoded.slice(sep + 1);
    if (user === validUser && pass === validPass) {
      return context.next();
    }
  }

  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="VM Property Sourcing - Confidential Deal Pack"',
      "Content-Type": "text/plain",
    },
  });
};

export const config = { path: "/deals/*" };
// redeploy trigger: env vars fixed 2026-07-15T22:58:58Z
