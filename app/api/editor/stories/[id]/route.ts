import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { storyCandidates } from "@/db/schema";

const allowedStatuses = new Set(["selected", "dismissed", "alerted"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  if (host !== "editor.berlabs.dev") {
    return Response.json({ error: "This editor endpoint is only available on the protected editor domain." }, { status: 403 });
  }

  const { status } = await request.json() as { status?: string };
  if (!status || !allowedStatuses.has(status)) {
    return Response.json({ error: "Invalid story status." }, { status: 400 });
  }

  const { id } = await context.params;
  const selectedForDate = status === "selected" || status === "alerted" ? new Date().toISOString().slice(0, 10) : null;
  const alertedAt = status === "alerted" ? new Date().toISOString() : null;
  const db = getDb();
  await db.update(storyCandidates).set({ status, selectedForDate, alertedAt, updatedAt: new Date().toISOString() }).where(eq(storyCandidates.id, id));
  return Response.json({ story: { id, status } });
}
