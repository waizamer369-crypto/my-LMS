import { authRouter } from "./auth-router";
import { lmsRouter } from "./lmsRouter";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  lms: lmsRouter,
});

export type AppRouter = typeof appRouter;
