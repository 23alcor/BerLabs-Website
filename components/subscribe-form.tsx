"use client";

import { FormEvent, useState } from "react";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) throw new Error(result.error ?? "Something went wrong.");

      setMessage(result.message ?? "Check your email for a confirmation link.");
      setEmail("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="self-end rounded-[1.5rem] border border-[#9eff6b]/40 bg-[#102d29] p-7" onSubmit={subscribe}>
      <label className="font-mono text-xs uppercase tracking-[0.14em] text-[#9eff6b]" htmlFor="email">
        Your email
      </label>
      <input
        autoComplete="email"
        className="mt-3 w-full rounded-xl border border-[#b8c7bd]/35 bg-[#071716] px-4 py-3 text-base text-[#f6f1e6] outline-none placeholder:text-[#799187] focus:border-[#9eff6b]"
        id="email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
        type="email"
        value={email}
      />
      <button className="mt-4 inline-flex w-full items-center justify-between rounded-xl bg-[#9eff6b] px-5 py-4 font-mono text-sm font-semibold text-[#071716] transition hover:bg-[#b5ff90] disabled:cursor-wait disabled:opacity-60" disabled={sending} type="submit">
        {sending ? "Sending…" : "Subscribe to BerLabs"} <span aria-hidden="true">↗</span>
      </button>
      <p aria-live="polite" className="mt-4 text-sm leading-6 text-[#d7e2d6]">
        {message || "We’ll email you a confirmation link before adding you to the list."}
      </p>
    </form>
  );
}
