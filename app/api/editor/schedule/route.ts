import { asc, desc, inArray } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "@/db";
import { scheduledEditions, storyCandidates, subscribers } from "@/db/schema";
import { sendBerLabsEmail } from "@/lib/mailgun";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}

function nextSevenAmEastern() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  });
  const values = Object.fromEntries(formatter.formatToParts(new Date())
    .filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  const nextDay = new Date(Date.UTC(values.year, values.month - 1, values.day + 1, 7, 0, 0));
  const offsetParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(nextDay).filter((part) => part.type !== "literal");
  const offsetValues = Object.fromEntries(offsetParts.map((part) => [part.type, Number(part.value)]));
  const localAsUtc = Date.UTC(offsetValues.year, offsetValues.month - 1, offsetValues.day, offsetValues.hour, offsetValues.minute);
  return new Date(nextDay.getTime() - (localAsUtc - nextDay.getTime()));
}

export async function POST(request: Request) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  if (host !== "editor.berlabs.dev") return Response.json({ error: "This action is only available in the private editor." }, { status: 403 });

  const db = getDb();
  const [stories, recipients] = await Promise.all([
    db.select().from(storyCandidates).where(inArray(storyCandidates.status, ["selected", "alerted"]))
      .orderBy(asc(storyCandidates.importance), desc(storyCandidates.discoveredAt)),
    db.select({ email: subscribers.email }).from(subscribers).where(inArray(subscribers.status, ["confirmed"])),
  ]);
  if (!stories.length) return Response.json({ error: "Add at least one story to the Morning edition first." }, { status: 400 });
  if (!recipients.length) return Response.json({ error: "There are no confirmed subscribers yet." }, { status: 400 });

  const scheduledFor = nextSevenAmEastern();
  const scheduledKey = scheduledFor.toISOString();
  const subject = `BerLabs — ${new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "long", day: "numeric", year: "numeric" }).format(scheduledFor)}`;
  const storyMarkup = stories.map((story) => `<article style="margin:0 0 32px"><p style="color:#347c5f;font:600 12px monospace;letter-spacing:1px;text-transform:uppercase">${story.importance} · ${escapeHtml(story.source)}</p><h2 style="font-size:24px;line-height:1.15;margin:10px 0"><a style="color:#102d29" href="${escapeHtml(story.url)}">${escapeHtml(story.title)}</a></h2><p style="line-height:1.6">${escapeHtml(story.miniDraft)}</p><p style="border-left:3px solid #9eff6b;padding-left:14px;color:#4e6358"><strong>Why it matters:</strong> ${escapeHtml(story.whyItMatters)}</p></article>`).join("");
  const html = `<main style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:32px;color:#102d29"><p style="color:#347c5f;font-size:12px;letter-spacing:1.5px;text-transform:uppercase">BerLabs · Daily briefing</p><h1 style="font-size:34px;margin:12px 0 28px">${escapeHtml(subject.replace("BerLabs — ", ""))}</h1>${storyMarkup}<hr style="border:0;border-top:1px solid #d9e5db;margin-top:36px"><p style="font-size:12px;color:#5f7167">You are receiving BerLabs because you confirmed your subscription.</p></main>`;
  const text = [subject, "", ...stories.flatMap((story) => [story.title, story.miniDraft, `Why it matters: ${story.whyItMatters}`, story.url, ""])].join("\n");

  try {
    await db.insert(scheduledEditions).values({ id: crypto.randomUUID(), scheduledFor: scheduledKey, subject,
      storyCount: stories.length, recipientCount: recipients.length, status: "scheduling" });
  } catch {
    return Response.json({ error: "Tomorrow’s edition is already scheduled." }, { status: 409 });
  }

  try {
    for (const recipient of recipients) await sendBerLabsEmail({ to: recipient.email, subject, text, html, deliveryTime: scheduledFor });
    await env.DB.prepare("UPDATE scheduled_editions SET status = 'scheduled' WHERE scheduled_for = ?").bind(scheduledKey).run();
  } catch (error) {
    await env.DB.prepare("UPDATE scheduled_editions SET status = 'needs_review' WHERE scheduled_for = ?").bind(scheduledKey).run();
    console.error("Could not schedule daily edition", error);
    return Response.json({ error: "The edition needs review before it can be sent. No automatic retry was made." }, { status: 503 });
  }

  return Response.json({ scheduledFor: scheduledFor.toISOString(), recipientCount: recipients.length, storyCount: stories.length });
}
