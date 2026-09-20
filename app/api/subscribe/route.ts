import { env } from "cloudflare:workers";
import { createConfirmationToken, hashConfirmationToken } from "@/lib/confirmation";
import { sendBerLabsEmail } from "@/lib/mailgun";
import { hashValue } from "@/lib/confirmation";
import { verifyTurnstile } from "@/lib/turnstile";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const { email: submittedEmail, turnstileToken } = (await request.json()) as {
      email?: string;
      turnstileToken?: string;
    };
    const email = submittedEmail?.trim().toLowerCase() ?? "";

    if (!emailPattern.test(email) || email.length > 254) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!env.DB) throw new Error("Subscriber storage is unavailable.");
    if (!turnstileToken || turnstileToken.length > 2048) {
      return Response.json({ error: "Please complete the security check." }, { status: 400 });
    }

    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const isHuman = await verifyTurnstile(turnstileToken, ip);
    if (!isHuman) {
      return Response.json({ error: "Security verification failed. Please try again." }, { status: 403 });
    }

    const [emailHash, ipHash] = await Promise.all([
      hashValue(`email:${email}`),
      hashValue(`ip:${ip}`),
    ]);
    const oneHourAgo = "datetime('now', '-1 hour')";
    const [emailAttempts, ipAttempts] = await Promise.all([
      env.DB.prepare(`SELECT COUNT(*) AS count FROM signup_attempts WHERE subject_hash = ? AND created_at > ${oneHourAgo}`)
        .bind(emailHash)
        .first<{ count: number }>(),
      env.DB.prepare(`SELECT COUNT(*) AS count FROM signup_attempts WHERE subject_hash = ? AND created_at > ${oneHourAgo}`)
        .bind(ipHash)
        .first<{ count: number }>(),
    ]);

    if ((emailAttempts?.count ?? 0) >= 3 || (ipAttempts?.count ?? 0) >= 10) {
      return Response.json({ error: "Please wait an hour before requesting another confirmation email." }, { status: 429 });
    }

    await env.DB.batch([
      env.DB.prepare("INSERT INTO signup_attempts (subject_hash) VALUES (?)").bind(emailHash),
      env.DB.prepare("INSERT INTO signup_attempts (subject_hash) VALUES (?)").bind(ipHash),
    ]);

    const token = createConfirmationToken();
    const tokenHash = await hashConfirmationToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const existing = await env.DB.prepare(
      "SELECT status FROM subscribers WHERE email = ?",
    ).bind(email).first<{ status: string }>();

    if (existing?.status === "confirmed") {
      return Response.json({
        message: "Check your inbox for the next BerLabs issue.",
      });
    }

    await env.DB.prepare(
      `INSERT INTO subscribers (
        email, status, confirmation_token_hash, confirmation_expires_at, created_at, updated_at
      ) VALUES (?, 'pending', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(email) DO UPDATE SET
        status = 'pending',
        confirmation_token_hash = excluded.confirmation_token_hash,
        confirmation_expires_at = excluded.confirmation_expires_at,
        updated_at = CURRENT_TIMESTAMP`,
    ).bind(email, tokenHash, expiresAt).run();

    const origin = env.SITE_ORIGIN ?? "https://news.berlabs.dev";
    const confirmationUrl = `${origin}/api/confirm?token=${encodeURIComponent(token)}`;

    await sendBerLabsEmail({
      to: email,
      subject: "Confirm your BerLabs subscription",
      text: `Confirm your BerLabs subscription by opening this link: ${confirmationUrl}\n\nIf you did not request this, you can ignore this email.`,
      html: `<main style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#102d29"><p style="color:#347c5f;font-size:12px;letter-spacing:1.5px;text-transform:uppercase">BerLabs</p><h1 style="font-size:30px">Confirm your subscription.</h1><p>One click confirms that you want to receive BerLabs.</p><p style="margin:28px 0"><a href="${confirmationUrl}" style="background:#9eff6b;color:#071716;padding:14px 20px;border-radius:10px;text-decoration:none;font-weight:700">Confirm subscription</a></p><p style="font-size:13px;color:#5f7167">If you did not request this, you can ignore this email.</p></main>`,
    });

    return Response.json({
      message: "Check your email for a confirmation link.",
    });
  } catch (error) {
    console.error("Unable to start subscription", error);
    return Response.json(
      { error: "We couldn’t send the confirmation email. Please try again shortly." },
      { status: 503 },
    );
  }
}
