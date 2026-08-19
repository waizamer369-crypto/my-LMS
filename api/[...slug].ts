import { handle } from "hono/vercel";

export const config = { runtime: "nodejs" };

export default handle(async (c) => {
  try {
    const { default: app } = await import("../server/app.js");
    return app.fetch(c.req.raw, c.env);
  } catch (err: any) {
    return c.json(
      { error: "Module load failed", message: err.message, stack: err.stack },
      500
    );
  }
});