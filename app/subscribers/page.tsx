import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { subscribers } from "@/db/schema";

function dateLabel(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default async function SubscribersPage() {
  const host = (await headers()).get("host")?.split(":")[0].toLowerCase();
  if (host !== "editor.berlabs.dev") notFound();

  const records = await getDb().select({
    id: subscribers.id,
    email: subscribers.email,
    status: subscribers.status,
    createdAt: subscribers.createdAt,
    confirmedAt: subscribers.confirmedAt,
  }).from(subscribers).orderBy(desc(subscribers.createdAt)).limit(500);
  const confirmed = records.filter((subscriber) => subscriber.status === "confirmed").length;

  return (
    <main className="min-h-screen bg-[#081311] px-5 py-8 text-[#f5f1e8] md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-[#d4e0d3]/20 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="https://editor.berlabs.dev/" className="font-mono text-xs uppercase tracking-[0.22em] text-[#9eff6b] transition hover:text-[#d4e0d3]">← BerLabs desk</a>
            <h1 className="mt-4 font-serif text-5xl tracking-[-0.055em]">Subscribers</h1>
            <p className="mt-3 max-w-xl text-[#b7c6ba]">A private, newest-first view of everyone who signed up for BerLabs.</p>
          </div>
          <div className="rounded-xl border border-[#9eff6b]/30 bg-[#10251f] px-4 py-3 font-mono text-xs text-[#d4e0d3]">
            {confirmed} confirmed · {records.length} total
          </div>
        </header>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#d4e0d3]/15 bg-[#0c1b17]">
          {records.length === 0 ? (
            <p className="p-8 text-[#b7c6ba]">No subscribers yet.</p>
          ) : (
            <div className="max-h-[68vh] overflow-y-auto">
              <table className="w-full min-w-[38rem] text-left">
                <thead className="sticky top-0 bg-[#10251f] font-mono text-[11px] uppercase tracking-[0.15em] text-[#9eff6b]">
                  <tr><th className="px-5 py-4 font-medium">Email</th><th className="px-5 py-4 font-medium">Status</th><th className="px-5 py-4 font-medium">Signed up</th><th className="px-5 py-4 font-medium">Confirmed</th></tr>
                </thead>
                <tbody className="divide-y divide-[#d4e0d3]/10 text-sm">
                  {records.map((subscriber) => <tr key={subscriber.id} className="hover:bg-[#10251f]/70">
                    <td className="px-5 py-4 text-[#f5f1e8]">{subscriber.email}</td>
                    <td className="px-5 py-4"><span className={subscriber.status === "confirmed" ? "rounded-full bg-[#9eff6b]/15 px-2.5 py-1 font-mono text-xs text-[#9eff6b]" : "rounded-full bg-[#d4e0d3]/10 px-2.5 py-1 font-mono text-xs text-[#b7c6ba]"}>{subscriber.status}</span></td>
                    <td className="px-5 py-4 text-[#b7c6ba]">{dateLabel(subscriber.createdAt)}</td>
                    <td className="px-5 py-4 text-[#b7c6ba]">{dateLabel(subscriber.confirmedAt)}</td>
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
