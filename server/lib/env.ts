function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || "3000", 10),

  // Adjust these names if your .env file uses different keys
  databaseUrl: required("DATABASE_URL", process.env.DATABASE_URL),
  appId: required("KIMI_APP_ID", process.env.KIMI_APP_ID),
  appSecret: required("KIMI_APP_SECRET", process.env.KIMI_APP_SECRET),
  kimiAuthUrl: process.env.KIMI_AUTH_URL || "https://kimi.moonshot.cn",
  ownerUnionId: process.env.OWNER_UNION_ID,
};