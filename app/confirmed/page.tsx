import Link from "next/link";

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const confirmed = state === "confirmed";

  return (
    <main className="grid min-h-screen place-items-center bg-[#071716] px-6 text-[#f6f1e6]">
      <section className="max-w-xl rounded-[1.5rem] border border-[#9eff6b]/40 bg-[#102d29] p-8 md:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#9eff6b]">BerLabs</p>
        <h1 className="mt-5 font-serif text-5xl tracking-[-0.06em]">
          {confirmed ? "Confirmed!" : "This link has expired."}
        </h1>
        <p className="mt-6 text-lg leading-8 text-[#d7e2d6]">
          {confirmed
            ? "Watch out for the next email tomorrow at 7am! Check your email for instructions to receive daily news!"
            : "Request a new confirmation email from the BerLabs homepage."}
        </p>
        <Link className="mt-8 inline-flex rounded-xl bg-[#9eff6b] px-5 py-3 font-mono text-sm font-semibold text-[#071716]" href="/">
          Back to BerLabs
        </Link>
      </section>
    </main>
  );
}
