import { z } from "zod";
import * as cookie from "cookie";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { Session, ErrorMessages } from "../contracts/constants.js";
import { getSessionCookieOptions } from "./lib/cookies.js";
import { hashPassword, verifyPassword, createSessionToken } from "./lib/auth.js";
import { createRouter, authedQuery, publicQuery } from "./trpc-init.js";

async function issueSession(
  userId: number,
  headers: Headers,
  resHeaders: Headers,
) {
  const token = await createSessionToken(userId);
  const opts = getSessionCookieOptions(headers);
  resHeaders.append(
    "set-cookie",
    cookie.serialize(Session.cookieName, token, {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite,
      secure: opts.secure,
      maxAge: Math.floor(Session.maxAgeMs / 1000),
    }),
  );
}

export const authRouter = createRouter({
  me: authedQuery.query((opts) => {
    const { passwordHash: _passwordHash, ...safeUser } = opts.ctx.user;
    return safeUser;
  }),

  signup: publicQuery
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Enter a valid email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email.toLowerCase().trim();

      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: ErrorMessages.emailTaken,
        });
      }

      const passwordHash = await hashPassword(input.password);

      const [user] = await db
        .insert(users)
        .values({
          unionId: email,
          name: input.name,
          email,
          passwordHash,
          role: "user",
        })
        .returning();

      await issueSession(user.id, ctx.req.headers, ctx.resHeaders);

      return { id: user.id, name: user.name, email: user.email, role: user.role };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email("Enter a valid email"),
        password: z.string().min(1, "Password is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email.toLowerCase().trim();

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: ErrorMessages.invalidCredentials,
        });
      }

      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: ErrorMessages.invalidCredentials,
        });
      }

      await db
        .update(users)
        .set({ lastSignInAt: new Date() })
        .where(eq(users.id, user.id));

      await issueSession(user.id, ctx.req.headers, ctx.resHeaders);

      return { id: user.id, name: user.name, email: user.email, role: user.role };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite,
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
