export const Session = {
  cookieName: "session_token",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
  invalidCredentials: "Invalid email or password",
  emailTaken: "An account with this email already exists",
} as const;

export const Paths = {
  login: "/login",
} as const;
