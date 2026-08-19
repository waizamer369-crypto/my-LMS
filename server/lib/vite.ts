import path from "path";
import { existsSync, readFileSync } from "fs";
import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

/**
 * Serves the built SPA (dist/public) in production and falls back to
 * index.html for any non-/api route so client-side routing works.
 */
export function serveStaticFiles(app: Hono<{ Bindings: HttpBindings }>) {
  const publicDir = path.resolve(process.cwd(), "dist/public");

  app.use(
    "*",
    serveStatic({
      root: path.relative(process.cwd(), publicDir),
    }),
  );

  app.get("*", (c) => {
    const indexPath = path.join(publicDir, "index.html");
    if (!existsSync(indexPath)) {
      return c.text("Build not found", 500);
    }
    return c.html(readFileSync(indexPath, "utf-8"));
  });
}
