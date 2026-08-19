export const config = { runtime: "nodejs" };

export default function handler(req: Request): Response {
  return new Response(JSON.stringify({ pong: true, env: Object.keys(process.env).filter(k => !k.includes("SECRET") && !k.includes("KEY") && !k.includes("PASS")) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}