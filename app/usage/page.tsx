import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { tokenUsage } from "@/db/schema";

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function labelForAction(action: string) {
  return action === "editor_story_draft" ? "Story draft" : action.replaceAll("_", " ");
}

export default async function UsagePage() {
  const host = (await headers()).get("host")?.split(":")[0].toLowerCase();
  if (host !== "editor.berlabs.dev") notFound();

  const records = await getDb().select().from(tokenUsage).orderBy(desc(tokenUsage.occurredAt)).limit(500);
  const totalTokens = records.reduce((total, record) => total + record.totalTokens, 0);

  return (
    <main className="min-h-screen bg-[#081311] px-5 py-8 text-[#f5f1e8] md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-[#d4e0d3]/20 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="https://editor.berlabs.dev/" className="font-mono text-xs uppercase tracking-[0.22em] text-[#9eff6b] transition hover:text-[#d4e0d3]">← BerLabs desk</a>
            <h1 className="mt-4 font-serif text-5xl tracking-[-0.055em]">Token usage</h1>
            <p className="mt-3 max-w-xl text-[#b7c6ba]">Every completed OpenAI story-drafting action recorded by the newsletter collector.</p>
          </div>
          <div className="rounded-xl border border-[#9eff6b]/30 bg-[#10251f] px-4 py-3 font-mono text-xs text-[#d4e0d3]">
            {totalTokens.toLocaleString()} tokens · {records.length} actions
          </div>
        </header>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#d4e0d3]/15 bg-[#0c1b17]">
          {records.length === 0 ? (
            <p className="p-8 text-[#b7c6ba]">No model usage recorded yet. The next story-collection run will appear here.</p>
          ) : (
            <div className="max-h-[68vh] overflow-y-auto">
              <table className="w-full min-w-[48rem] text-left">
                <thead className="sticky top-0 bg-[#10251f] font-mono text-[11px] uppercase tracking-[0.15em] text-[#9eff6b]">
                  <tr><th className="px-5 py-4 font-medium">Action</th><th className="px-5 py-4 font-medium">Model</th><th className="px-5 py-4 text-right font-medium">Input</th><th className="px-5 py-4 text-right font-medium">Output</th><th className="px-5 py-4 text-right font-medium">Total</th><th className="px-5 py-4 font-medium">When</th></tr>
                </thead>
                <tbody className="divide-y divide-[#d4e0d3]/10 text-sm">
                  {records.map((record) => <tr key={record.id} className="hover:bg-[#10251f]/70">
                    <td className="px-5 py-4 text-[#f5f1e8]">{labelForAction(record.action)}</td>
                    <td className="px-5 py-4 font-mono text-xs text-[#b7c6ba]">{record.model}</td>
                    <td className="px-5 py-4 text-right text-[#b7c6ba]">{record.inputTokens.toLocaleString()}</td>
                    <td className="px-5 py-4 text-right text-[#b7c6ba]">{record.outputTokens.toLocaleString()}</td>
                    <td className="px-5 py-4 text-right font-medium text-[#9eff6b]">{record.totalTokens.toLocaleString()}</td>
                    <td className="px-5 py-4 text-[#b7c6ba]">{dateLabel(record.occurredAt)}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
