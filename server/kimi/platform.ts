// NOTE: This endpoint is a best-effort guess based on how it's used
// elsewhere in this codebase. Verify it against the actual Kimi Open
// Platform API docs for your app, and adjust the URL/response fields
// if the shape doesn't match.
import { env } from "../lib/env";
import type { UserProfile } from "./types";

export const users = {
  async getProfile(accessToken: string): Promise<UserProfile | null> {
    const resp = await fetch(`${env.kimiAuthUrl}/api/user/info`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return {
      user_id: data.user_id ?? data.id,
      name: data.name ?? data.username,
      avatar_url: data.avatar_url ?? data.avatar,
    };
  },
};