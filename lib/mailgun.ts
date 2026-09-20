import { env } from "cloudflare:workers";

type Email = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

export async function sendBerLabsEmail({ html, subject, text, to }: Email) {
  const apiKey = env.MAILGUN_API_KEY;
  const domain = env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    throw new Error("Email delivery is not configured.");
  }

  const body = new FormData();
  body.set("from", "BerLabs <news@berlabs.dev>");
  body.set("to", to);
  body.set("subject", subject);
  body.set("text", text);
  body.set("html", html);

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`api:${apiKey}`)}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Mail delivery failed with status ${response.status}.`);
  }
}
