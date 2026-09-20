import { env } from "cloudflare:workers";

type TurnstileResponse = {
  action?: string;
  hostname?: string;
  success: boolean;
};

export async function verifyTurnstile(token: string, remoteIp: string | null) {
  const secret = env.TURNSTILE_SECRET;
  if (!secret) throw new Error("Bot protection is not configured.");

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: remoteIp }),
    },
  );

  if (!response.ok) return false;

  const result = (await response.json()) as TurnstileResponse;
  return (
    result.success &&
    result.action === "newsletter_signup" &&
    result.hostname === "news.berlabs.dev"
  );
}
