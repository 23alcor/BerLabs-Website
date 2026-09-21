import { desc, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { EditorDashboard, type StoryCard } from "@/components/editor-dashboard";
import { getDb } from "@/db";
import { storyCandidates, storySources } from "@/db/schema";

export default async function EditorPage() {
  const host = (await headers()).get("host")?.split(":")[0].toLowerCase();
  if (host !== "editor.berlabs.dev") notFound();
  const db = getDb();
  const candidates = await db.select().from(storyCandidates).orderBy(desc(storyCandidates.discoveredAt)).limit(100);
  const evidence = candidates.length
    ? await db.select().from(storySources).where(inArray(storySources.storyId, candidates.map((story) => story.id)))
    : [];
  const stories: StoryCard[] = candidates.map((story) => ({
    ...story,
    sources: evidence.filter((source) => source.storyId === story.id).map((source) => ({
      source: source.source, title: source.title, url: source.url, isPrimary: source.isPrimary,
    })),
  }));
  return <EditorDashboard stories={stories} />;
}
