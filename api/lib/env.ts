export const env = {
  isProduction: process.env.NODE_ENV === "production",
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-insecure-secret-change-me",
};

if (env.isProduction && env.jwtSecret === "dev-only-insecure-secret-change-me") {
  // eslint-disable-next-line no-console
  console.warn(
    "[auth] JWT_SECRET is not set in production. Set it in your Vercel project env vars.",
  );
}
