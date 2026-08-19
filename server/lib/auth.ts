import * as cookie from "cookie";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { SignJWT, jwtVerify } from "jose";
import { Session } from "../../contracts/constants.js";
import { db } from "../../db/client.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import type { User } from "../../db/schema.js";
import { env } from "./env.js";

const scrypt = promisify(scryptCallback);
const secretKey = new TextEncoder().encode(env.jwtSecret);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [salt, hashHex] = storedHash.split(":");
  if (!salt || !hashHex) return false;
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedBuffer = Buffer.from(hashHex, "hex");
  if (storedBuffer.length !== derivedKey.length) return false;
  return timingSafeEqual(storedBuffer, derivedKey);
}

export async function createSessionToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${Math.floor(Session.maxAgeMs / 1000)}s`)
    .sign(secretKey);
}

export async function authenticateRequest(
  headers: Headers,
): Promise<User | undefined> {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return undefined;

  const parsed = cookie.parse(cookieHeader);
  const token = parsed[Session.cookieName];
  if (!token) return undefined;

  try {
    const { payload } = await jwtVerify(token, secretKey);
    const userId = Number(payload.sub);
    if (!userId) return undefined;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user;
  } catch {
    return undefined;
  }
}