import { env } from "./env.js";

export function getSessionCookieOptions(_headers: Headers) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: env.isProduction,
  };
}