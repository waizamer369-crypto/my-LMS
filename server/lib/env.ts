function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(value: string | undefined): string | undefined {
  return value || undefined;
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: required("DATABASE_URL", process.env.DATABASE_URL),
  sessionSecret: required("SESSION_SECRET", process.env.SESSION_SECRET),
  appId: optional(process.env.KIMI_APP_ID),
  appSecret: optional(process.env.KIMI_APP_SECRET),
  kimiAuthUrl: process.env.KIMI_AUTH_URL || "https://kimi.moonshot.cn",
  ownerUnionId: process.env.OWNER_UNION_ID,
};