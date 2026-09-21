"use client";

import { useState } from "react";

export function ScheduleTestButton() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [notice, setNotice] = useState("");

  async function runTest() {
    setState("sending"); setNotice("");
    try {
      const response = await fetch("/api/editor/schedule-test", { method: "POST" });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not queue the test.");
      setState("done"); setNotice("Private test queued for one minute from now.");
    } catch (error) {
      setState("error"); setNotice(error instanceof Error ? error.message : "Could not queue the test.");
    }
  }

  return <div className="mt-4"><button type="button" disabled={state !== "idle"} onClick={runTest} className="font-mono text-xs text-[#b7c6ba] underline decoration-[#b7c6ba]/40 underline-offset-4 transition hover:text-[#9eff6b] disabled:cursor-not-allowed disabled:opacity-50">{state === "sending" ? "Queuing one-minute test…" : state === "done" ? "One-minute test queued" : "Send a private one-minute test"}</button>{notice && <p className={state === "error" ? "mt-3 text-sm text-[#ffb4a9]" : "mt-3 text-sm text-[#b7c6ba]"}>{notice}</p>}</div>;
}
