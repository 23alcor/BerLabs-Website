"use client";

import { useState } from "react";

export type StoryCard = {
  id: string;
  source: string;
  title: string;
  url: string;
  publishedAt: string | null;
  importance: number;
  summary: string;
  whyItMatters: string;
  miniDraft: string;
  status: string;
  corroboration: "primary" | "corroborated" | "needs_confirmation";
  sources: { source: string; title: string; url: string; isPrimary: boolean }[];
};

const statusLabels: Record<string, string> = {
  candidate: "In review",
  selected: "Morning edition",
  alerted: "Alert approved",
  dismissed: "Not using",
};

export function EditorDashboard({ stories }: { stories: StoryCard[] }) {
  const [items, setItems] = useState(stories);
  const [working, setWorking] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function updateStory(id: string, status: "selected" | "dismissed" | "alerted") {
    setWorking(`${id}:${status}`);
    setNotice("");
    try {
      const response = await fetch(`/api/editor/stories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { error?: string; story?: { status: string } };
      if (!response.ok || !payload.story) throw new Error(payload.error ?? "Could not update this story.");
      setItems((current) => current.map((story) => story.id === id ? { ...story, status: payload.story!.status } : story));
      setNotice(status === "alerted" ? "Alert approval recorded. Sending will be connected when the Telegram bot and mail sender are ready." : "Saved.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not update this story.");
    } finally {
      setWorking(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#081311] px-5 py-8 text-[#f5f1e8] md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-[#d4e0d3]/20 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#9eff6b]">Private editor</p>
            <h1 className="mt-3 font-serif text-5xl tracking-[-0.055em]">BerLabs desk</h1>
            <p className="mt-3 max-w-xl text-[#b7c6ba]">Review the stories gathered for the next issue. Rank 1 means urgent; 5 means background signal.</p>
          </div>
          <div className="rounded-xl border border-[#9eff6b]/30 bg-[#10251f] px-4 py-3 font-mono text-xs text-[#d4e0d3]">
            {items.filter((item) => item.status === "selected" || item.status === "alerted").length} stories queued
          </div>
        </header>

        {notice && <p className="mt-6 rounded-lg border border-[#9eff6b]/25 bg-[#10251f] px-4 py-3 text-sm text-[#dce7dc]">{notice}</p>}

        {items.length === 0 ? (
          <section className="mt-12 rounded-2xl border border-dashed border-[#b7c6ba]/35 bg-[#0c1b17] p-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#9eff6b]">No stories yet</p>
            <h2 className="mt-3 font-serif text-3xl">The desk is ready for its first collection.</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#b7c6ba]">The next step is connecting the hourly collector. When it runs, each story will arrive here with a summary, why-it-matters note, draft, and importance score.</p>
          </section>
        ) : (
          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            {items.map((story) => {
              const busy = working?.startsWith(`${story.id}:`);
              return <article key={story.id} className="rounded-2xl border border-[#d4e0d3]/15 bg-[#0c1b17] p-6">
                <div className="flex items-start justify-between gap-4"><p className="font-mono text-xs uppercase tracking-[0.14em] text-[#9eff6b]">{story.source}</p><span className="rounded-full border border-[#d4e0d3]/20 px-2.5 py-1 font-mono text-xs">{statusLabels[story.status] ?? story.status}</span></div><p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[#b7c6ba]">{story.corroboration.replace("_", " ")}</p>
                <div className="mt-5 flex items-start gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#9eff6b] font-mono text-sm font-bold text-[#081311]">{story.importance}</span><div><h2 className="font-serif text-2xl leading-tight"><a className="transition hover:text-[#9eff6b]" href={story.url} target="_blank" rel="noreferrer">{story.title}</a></h2><p className="mt-1 font-mono text-xs text-[#819487]">{story.publishedAt ?? "Newly found"}</p></div></div>
                <p className="mt-5 text-sm leading-6 text-[#d4e0d3]">{story.summary}</p>
                <div className="mt-5"><p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#9eff6b]">Sources · {story.sources.length}</p><ul className="mt-2 space-y-1 text-sm text-[#b7c6ba]">{story.sources.map((source) => <li key={source.url}><a className="transition hover:text-[#9eff6b]" href={source.url} target="_blank" rel="noreferrer">{source.source}</a>{source.isPrimary ? " · primary" : ""}</li>)}</ul></div>
                <div className="mt-5 border-l border-[#9eff6b]/60 pl-4"><p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#9eff6b]">Why it matters</p><p className="mt-2 text-sm leading-6 text-[#b7c6ba]">{story.whyItMatters}</p></div>
                <div className="mt-5 rounded-xl bg-[#10251f] p-4"><p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#9eff6b]">Mini draft</p><p className="mt-2 text-sm leading-6 text-[#d4e0d3]">{story.miniDraft}</p></div>
                <div className="mt-6 flex flex-wrap gap-2"><button disabled={busy} onClick={() => updateStory(story.id, "selected")} className="rounded-full bg-[#9eff6b] px-4 py-2 font-mono text-xs font-semibold text-[#081311] disabled:opacity-50">Add to morning</button><button disabled={busy || story.importance !== 1} onClick={() => updateStory(story.id, "alerted")} className="rounded-full border border-[#9eff6b] px-4 py-2 font-mono text-xs text-[#9eff6b] disabled:cursor-not-allowed disabled:opacity-35">Approve urgent alert</button><button disabled={busy} onClick={() => updateStory(story.id, "dismissed")} className="rounded-full border border-[#d4e0d3]/25 px-4 py-2 font-mono text-xs text-[#b7c6ba] disabled:opacity-50">Dismiss</button></div>
              </article>;
            })}
          </section>
        )}
      </div>
    </main>
  );
}
