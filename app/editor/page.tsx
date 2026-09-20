import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { EditorDashboard, type StoryCard } from "@/components/editor-dashboard";
import { getDb } from "@/db";
import { storyCandidates } from "@/db/schema";

export default async function EditorPage() {
  const host = (await headers()).get("host")?.split(":")[0].toLowerCase();
  if (host !== "editor.berlabs.dev") notFound();
  const stories = await getDb().select().from(storyCandidates).orderBy(desc(storyCandidates.discoveredAt)).limit(100) as StoryCard[];
  return <EditorDashboard stories={stories} />;
}
