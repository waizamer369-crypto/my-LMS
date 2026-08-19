import app from "../server/app.js";

export const config = { runtime: "nodejs" };

export default async function handler(req: any, res: any) {
  try {
    // Hono's fetch expects a standard Request, but Vercel gives us IncomingMessage-like req
    // We need to convert it
    const url = `https://${req.headers.host || "my-lms-v2.vercel.app"}${req.url}`;
    const body = req.method !== "GET" && req.method !== "HEAD" 
      ? JSON.stringify(req.body) 
      : undefined;
    
    const request = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers),
      body,
    });

    const response = await app.fetch(request, {});

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(await response.text());
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack?.split("\n").slice(0, 5) });
  }
}