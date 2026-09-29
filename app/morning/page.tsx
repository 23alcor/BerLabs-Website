import { asc, desc, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { storyCandidates, subscribers } from "@/db/schema";
import { ScheduleEditionButton } from "@/components/schedule-edition-button";
import { ScheduleTestButton } from "@/components/schedule-test-button";

export default async function MorningPage() {
  const host = (await headers()).get("host")?.split(":")[0].toLowerCase();
  if (host !== "editor.berlabs.dev") notFound();

  const db = getDb();
  const [stories, confirmedSubscribers] = await Promise.all([
    db.select().from(storyCandidates)
      .where(inArray(storyCandidates.status, ["selected", "alerted"]))
      .orderBy(asc(storyCandidates.importance), desc(storyCandidates.discoveredAt)),
    db.select({ id: subscribers.id }).from(subscribers).where(eq(subscribers.status, "confirmed")),
  ]);

  return (
    <main className="min-h-screen bg-[#081311] px-5 py-8 text-[#f5f1e8] md:px-10">
      <div className="mx-auto max-w-4xl">
        <header className="border-b border-[#d4e0d3]/20 pb-7">
          <a href="https://editor.berlabs.dev/" className="font-mono text-xs uppercase tracking-[0.22em] text-[#9eff6b] transition hover:text-[#d4e0d3]">← BerLabs desk</a>
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#9eff6b]">Next morning</p>
              <h1 className="mt-3 font-serif text-5xl tracking-[-0.055em]">Morning edition</h1>
              <p className="mt-3 max-w-xl text-[#b7c6ba]">Your selected stories, automatically ordered from most important to least important.</p>
            </div>
            <div className="rounded-xl border border-[#9eff6b]/30 bg-[#10251f] px-4 py-3 font-mono text-xs text-[#d4e0d3]">{stories.length} stories queued</div>
          </div>
        </header>

        <ScheduleEditionButton disabled={stories.length === 0} />
        <ScheduleTestButton />

        {stories.length > 0 && (
          <section className="mt-10 overflow-hidden rounded-2xl border border-[#d4e0d3]/15 bg-[#0c1b17]">
            <div className="flex flex-col gap-3 border-b border-[#d4e0d3]/15 bg-[#10251f] px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#9eff6b]">Subscriber preview</p>
                <h2 className="mt-1 font-serif text-2xl">Tomorrow’s email, before it sends</h2>
              </div>
              <p className="font-mono text-xs text-[#b7c6ba]">{confirmedSubscribers.length} confirmed subscriber{confirmedSubscribers.length === 1 ? "" : "s"}</p>
            </div>
            <div className="bg-[#f5f1e8] px-6 py-8 text-[#102d29] md:px-10">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#347c5f]">BerLabs · Daily briefing</p>
              <h3 className="mt-3 font-serif text-4xl leading-tight">The stories for tomorrow morning</h3>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#4e6358]">This is the same story order and copy that will be delivered when you schedule the edition.</p>
              <div className="mt-8 space-y-8">
                {stories.map((story) => <article key={story.id}>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.13em] text-[#347c5f]">{story.importance} · {story.source}</p>
                  <h4 className="mt-2 font-serif text-2xl leading-tight">{story.title}</h4>
                  <p className="mt-3 text-base leading-7 text-[#274038]">{story.miniDraft}</p>
                  <p className="mt-4 border-l-4 border-[#9eff6b] pl-4 text-sm leading-6 text-[#4e6358]"><strong>Why it matters:</strong> {story.whyItMatters}</p>
                </article>)}
              </div>
              <div className="mt-8 border-t border-[#d9e5db] pt-5 text-xs leading-5 text-[#5f7167]">You are receiving BerLabs because you confirmed your subscription.</div>
            </div>
          </section>
        )}

        {stories.length === 0 ? (
          <section className="mt-10 rounded-2xl border border-dashed border-[#b7c6ba]/35 bg-[#0c1b17] p-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#9eff6b]">Nothing queued</p>
            <p className="mx-auto mt-3 max-w-lg text-[#b7c6ba]">Use “Add to morning” on the desk to build the next edition.</p>
          </section>
        ) : (
          <section className="mt-8 space-y-5">
            {stories.map((story, index) => <article key={story.id} className="rounded-2xl border border-[#d4e0d3]/15 bg-[#0c1b17] p-6 md:p-8">
              <div className="flex items-start justify-between gap-5">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#9eff6b]">{String(index + 1).padStart(2, "0")} · {story.source}</p>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#9eff6b] font-mono text-sm font-bold text-[#081311]">{story.importance}</span>
              </div>
              <h2 className="mt-5 font-serif text-3xl leading-tight"><a href={story.url} target="_blank" rel="noreferrer" className="transition hover:text-[#9eff6b]">{story.title}</a></h2>
              <p className="mt-5 text-base leading-7 text-[#d4e0d3]">{story.miniDraft}</p>
              <div className="mt-6 border-l border-[#9eff6b]/60 pl-4"><p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#9eff6b]">Why it matters</p><p className="mt-2 text-sm leading-6 text-[#b7c6ba]">{story.whyItMatters}</p></div>
            </article>)}
          </section>
        )}
      </div>
    </main>
  );
}
