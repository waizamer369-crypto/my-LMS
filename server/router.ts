import { authRouter } from "./auth-router.js";
import { lmsRouter } from "./lmsRouter.js";
import { createRouter, publicQuery } from "./trpc-init.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  lms: lmsRouter,
});
export type AppRouter = typeof appRouter;