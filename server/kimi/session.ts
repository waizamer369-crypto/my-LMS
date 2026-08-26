import * as jose from "jose";
import { env } from "../lib/env";
import type { SessionPayload } from "./types";

const JWT_ALG = "HS256";

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  const secret = new TextEncoder().encode(env.jwtSecret);
  return new jose.SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("1 year")
    .sign(secret);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  if (!token) {
    console.warn("[session] No token provided for verification.");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(env.jwtSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
    });
    const { unionId, clientId, userId } = payload;
    if (!unionId && !userId) {
      console.warn("[session] JWT payload missing required fields.");
      return null;
    }
    return {
      unionId: unionId as string | undefined,
      clientId: clientId as string | undefined,
      userId: userId as number | undefined,
    };
  } catch (error) {
    console.warn("[session] JWT verification failed:", error);
    return null;
  }
}