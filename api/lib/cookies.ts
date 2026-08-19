import { env } from "./env";

/**
 * Cookie options for the session cookie.
 * Secure is forced on in production (required for SameSite=None / HTTPS on Vercel);
 * left off in local dev so http://localhost works without HTTPS.
 */
export function getSessionCookieOptions(_headers: Headers) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: env.isProduction,
  };
}
