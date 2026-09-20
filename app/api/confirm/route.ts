import { env } from "cloudflare:workers";
import { hashConfirmationToken } from "@/lib/confirmation";
import { sendBerLabsEmail } from "@/lib/mailgun";

function confirmedRedirect(state: "confirmed" | "invalid") {
  const origin = env.SITE_ORIGIN ?? "https://news.berlabs.dev";
  return Response.redirect(`${origin}/confirmed?state=${state}`, 302);
}

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token") ?? "";

    if (!token || token.length > 128 || !env.DB) return confirmedRedirect("invalid");

    const tokenHash = await hashConfirmationToken(token);
    const subscriber = await env.DB.prepare(
      `SELECT id, email, status FROM subscribers
       WHERE confirmation_token_hash = ? AND confirmation_expires_at > CURRENT_TIMESTAMP`,
    ).bind(tokenHash).first<{ id: number; email: string; status: string }>();

    if (!subscriber) return confirmedRedirect("invalid");

    const update = await env.DB.prepare(
      `UPDATE subscribers
       SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'pending'`,
    ).bind(subscriber.id).run();

    if (update.meta.changes > 0) {
      await sendBerLabsEmail({
        to: subscriber.email,
        subject: "A quick note to help BerLabs reach your inbox",
        text: "You’re confirmed for BerLabs. To make sure future issues are easy to find, add news@berlabs.dev to your contacts and, if Gmail places an issue outside Primary, move it to Primary. Replying to an issue also tells your mailbox that you want to hear from BerLabs.",
        html: `<main style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#102d29"><p style="color:#347c5f;font-size:12px;letter-spacing:1.5px;text-transform:uppercase">BerLabs</p><h1 style="font-size:30px">You’re in.</h1><p>To make BerLabs easy to find:</p><ol><li>Add <strong>news@berlabs.dev</strong> to your contacts.</li><li>If Gmail places an issue outside Primary, move it to Primary.</li><li>Replying to an issue is another helpful signal that you want to hear from BerLabs.</li></ol><p>See you in the next dispatch.</p></main>`,
      });

      await env.DB.prepare(
        "UPDATE subscribers SET onboarding_sent_at = CURRENT_TIMESTAMP WHERE id = ?",
      ).bind(subscriber.id).run();
    }

    return confirmedRedirect("confirmed");
  } catch (error) {
    console.error("Unable to confirm subscription", error);
    return confirmedRedirect("invalid");
  }
}
