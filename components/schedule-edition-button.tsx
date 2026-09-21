"use client";

import { useState } from "react";

export function ScheduleEditionButton({ disabled }: { disabled: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [notice, setNotice] = useState("");

  async function schedule() {
    if (!window.confirm("Schedule this edition for tomorrow at 7:00 a.m. Eastern for all confirmed subscribers?")) return;
    setState("sending"); setNotice("");
    try {
      const response = await fetch("/api/editor/schedule", { method: "POST" });
      const payload = await response.json() as { error?: string; recipientCount?: number };
      if (!response.ok) throw new Error(payload.error ?? "Could not schedule the edition.");
      setState("done"); setNotice(`Scheduled for ${payload.recipientCount} confirmed subscriber${payload.recipientCount === 1 ? "" : "s"}.`);
    } catch (error) {
      setState("error"); setNotice(error instanceof Error ? error.message : "Could not schedule the edition.");
    }
  }

  return <div className="mt-6"><button type="button" disabled={disabled || state === "sending" || state === "done"} onClick={schedule} className="rounded-full bg-[#9eff6b] px-5 py-3 font-mono text-xs font-semibold text-[#081311] disabled:cursor-not-allowed disabled:opacity-40">{state === "sending" ? "Scheduling…" : state === "done" ? "Scheduled" : "Schedule for 7:00 a.m. →"}</button>{notice && <p className={state === "error" ? "mt-3 text-sm text-[#ffb4a9]" : "mt-3 text-sm text-[#b7c6ba]"}>{notice}</p>}</div>;
}
