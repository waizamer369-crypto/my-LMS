import { serveStatic } from "@hono/node-server/serve-static";
import type { Hono } from "hono";

export function serveStaticFiles(app: Hono) {
  app.use("/*", serveStatic({ root: "./dist/public" }));
  app.get("*", serveStatic({ path: "./dist/public/index.html" }));
}