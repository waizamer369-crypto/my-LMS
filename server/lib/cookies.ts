export function getSessionCookieOptions(headers: Headers) {
  const proto = headers.get("x-forwarded-proto");
  const isHttps = proto === "https" || process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    path: "/",
    sameSite: "Lax" as const,
    secure: isHttps,
  };
}