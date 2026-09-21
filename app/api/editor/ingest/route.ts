import { env } from "cloudflare:workers";
import { getDb } from "@/db";
import { storyCandidates, storySources, tokenUsage } from "@/db/schema";

type IncomingSource = { id: string; source: string; title: string; url: string; publishedAt?: string | null; isPrimary?: boolean };
type IncomingStory = {
  id: string; source: string; title: string; url: string; publishedAt?: string | null;
  importance: number; summary: string; whyItMatters: string; miniDraft: string;
  corroboration: "primary" | "corroborated" | "needs_confirmation";
  sources: IncomingSource[];
};
type IncomingUsage = {
  id: string; action: string; model: string; inputTokens: number; outputTokens: number;
  totalTokens: number; occurredAt: string;
};

function isValidStory(story: IncomingStory) {
  return typeof story.id === "string" && story.id.length <= 128 &&
    typeof story.source === "string" && story.source.length <= 160 &&
    typeof story.title === "string" && story.title.length <= 600 &&
    /^https:\/\//.test(story.url) && story.url.length <= 2000 &&
    Number.isInteger(story.importance) && story.importance >= 1 && story.importance <= 5 &&
    typeof story.summary === "string" && story.summary.length <= 3000 &&
    typeof story.whyItMatters === "string" && story.whyItMatters.length <= 2000 &&
    typeof story.miniDraft === "string" && story.miniDraft.length <= 3000 &&
    ["primary", "corroborated", "needs_confirmation"].includes(story.corroboration) &&
    Array.isArray(story.sources) && story.sources.length > 0 && story.sources.length <= 12;
}

function isValidUsage(event: IncomingUsage) {
  return typeof event.id === "string" && event.id.length <= 128 &&
    typeof event.action === "string" && event.action.length <= 120 &&
    typeof event.model === "string" && event.model.length <= 160 &&
    Number.isInteger(event.inputTokens) && event.inputTokens >= 0 &&
    Number.isInteger(event.outputTokens) && event.outputTokens >= 0 &&
    Number.isInteger(event.totalTokens) && event.totalTokens === event.inputTokens + event.outputTokens &&
    typeof event.occurredAt === "string" && !Number.isNaN(Date.parse(event.occurredAt));
}

export async function POST(request: Request) {
  const suppliedSecret = request.headers.get("x-editor-ingest-secret");
  if (!env.EDITOR_INGEST_SECRET || suppliedSecret !== env.EDITOR_INGEST_SECRET) {
    return Response.json({ error: "Unauthorized ingest request." }, { status: 401 });
  }

  const body = await request.json() as { stories?: IncomingStory[]; usage?: IncomingUsage[] };
  if (!Array.isArray(body.stories) || body.stories.length > 50 || !body.stories.every(isValidStory) ||
      (body.usage !== undefined && (!Array.isArray(body.usage) || body.usage.length > 50 || !body.usage.every(isValidUsage)))) {
    return Response.json({ error: "Invalid story payload." }, { status: 400 });
  }

  const db = getDb();
  for (const story of body.stories) {
    await db.insert(storyCandidates).values({
      id: story.id, source: story.source, title: story.title, url: story.url,
      publishedAt: story.publishedAt ?? null, importance: story.importance,
      summary: story.summary, whyItMatters: story.whyItMatters,
      miniDraft: story.miniDraft, corroboration: story.corroboration, status: "candidate", updatedAt: new Date().toISOString(),
    }).onConflictDoUpdate({
      target: storyCandidates.url,
      set: {
        source: story.source, title: story.title, publishedAt: story.publishedAt ?? null,
        importance: story.importance, summary: story.summary, whyItMatters: story.whyItMatters,
        miniDraft: story.miniDraft, corroboration: story.corroboration, updatedAt: new Date().toISOString(),
      },
    });
    for (const source of story.sources) {
      await db.insert(storySources).values({
        id: source.id, storyId: story.id, source: source.source, title: source.title,
        url: source.url, publishedAt: source.publishedAt ?? null, isPrimary: Boolean(source.isPrimary),
      }).onConflictDoUpdate({
        target: storySources.url,
        set: { storyId: story.id, source: source.source, title: source.title,
          publishedAt: source.publishedAt ?? null, isPrimary: Boolean(source.isPrimary) },
      });
    }
  }
  for (const event of body.usage ?? []) {
    await db.insert(tokenUsage).values({
      id: event.id, action: event.action, model: event.model,
      inputTokens: event.inputTokens, outputTokens: event.outputTokens,
      totalTokens: event.totalTokens, occurredAt: event.occurredAt,
    }).onConflictDoNothing();
  }
  return Response.json({ accepted: body.stories.length, usageRecorded: body.usage?.length ?? 0 });
}
