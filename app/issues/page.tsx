type GhostPost = {
  id: string;
  published_at: string;
  title: string;
  url: string;
};

const ghostApiUrl = "https://archive.berlabs.dev";
const legacyGhostHost = "news.alcoberlabs.xyz";

function formatIssueDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(date));
}

function canonicalIssueUrl(url: string) {
  try {
    const issueUrl = new URL(url);

    if (issueUrl.hostname === legacyGhostHost) {
      issueUrl.protocol = "https:";
      issueUrl.hostname = "archive.berlabs.dev";
    }

    return issueUrl.toString();
  } catch {
    return url;
  }
}

async function getIssues(): Promise<GhostPost[]> {
  const contentApiKey = process.env.GHOST_CONTENT_API_KEY;

  if (!contentApiKey) return [];

  try {
    const response = await fetch(
      `${ghostApiUrl}/ghost/api/content/posts/?key=${contentApiKey}&limit=all&fields=id,title,published_at,url`,
      { cache: "no-store" },
    );

    if (!response.ok) throw new Error(`Ghost returned ${response.status}`);

    const { posts } = (await response.json()) as { posts: GhostPost[] };
    return posts;
  } catch (error) {
    console.error("Unable to load Ghost archive", error);
    return [];
  }
}

export default async function IssuesPage() {
  const issues = await getIssues();

  return (
    <main className="min-h-screen bg-[#071716] px-6 py-8 text-[#f6f1e6] md:px-10">
      <nav className="mx-auto flex max-w-5xl items-center justify-between border-b border-[#b8c7bd]/20 pb-6 font-mono text-xs uppercase tracking-[0.14em]">
        <a className="text-[#9eff6b]" href="https://news.berlabs.dev/">← BerLabs</a>
        <a className="text-[#b8c7bd] transition hover:text-[#9eff6b]" href="https://archive.berlabs.dev/#/portal/signup">Subscribe</a>
      </nav>

      <section className="mx-auto max-w-5xl py-20 md:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#9eff6b]">The archive</p>
        <h1 className="mt-5 font-serif text-5xl tracking-[-0.06em] md:text-7xl">Every signal, in one place.</h1>

        {issues.length > 0 ? (
          <div className="mt-16 divide-y divide-[#b8c7bd]/20 border-y border-[#b8c7bd]/20">
            {issues.map((issue, index) => (
              <a key={issue.id} className="group flex items-center justify-between gap-5 py-8 transition hover:bg-[#0b2220]" href={canonicalIssueUrl(issue.url)}>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#b8c7bd]">Issue {String(index + 1).padStart(3, "0")} · {formatIssueDate(issue.published_at)}</p>
                  <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] group-hover:text-[#9eff6b]">{issue.title}</h2>
                </div>
                <span className="font-mono text-xl text-[#9eff6b]">↗</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-16 max-w-lg text-sm leading-6 text-[#b8c7bd]">The archive is temporarily unavailable. Please check back shortly.</p>
        )}
      </section>
    </main>
  );
}
