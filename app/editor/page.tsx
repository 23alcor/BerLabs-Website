import { desc } from "drizzle-orm";
import { EditorDashboard, type StoryCard } from "@/components/editor-dashboard";
import { getDb } from "@/db";
import { storyCandidates } from "@/db/schema";

export default async function EditorPage() {
  const stories = await getDb().select().from(storyCandidates).orderBy(desc(storyCandidates.discoveredAt)).limit(100) as StoryCard[];
  return <EditorDashboard stories={stories} />;
}
