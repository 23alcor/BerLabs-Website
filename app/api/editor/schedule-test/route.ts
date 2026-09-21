import { env } from "cloudflare:workers";
import { sendBerLabsEmail } from "@/lib/mailgun";

function nextSevenAmEastern() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  });
  const values = Object.fromEntries(formatter.formatToParts(new Date())
    .filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  const nextDay = new Date(Date.UTC(values.year, values.month - 1, values.day + 1, 7, 0, 0));
  const offsetParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(nextDay).filter((part) => part.type !== "literal");
  const offsetValues = Object.fromEntries(offsetParts.map((part) => [part.type, Number(part.value)]));
  const localAsUtc = Date.UTC(offsetValues.year, offsetValues.month - 1, offsetValues.day, offsetValues.hour, offsetValues.minute);
  return new Date(nextDay.getTime() - (localAsUtc - nextDay.getTime()));
}

export async function POST(request: Request) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  if (host !== "editor.berlabs.dev") return Response.json({ error: "This action is only available in the private editor." }, { status: 403 });
  if (!env.SCHEDULE_TEST_EMAIL) return Response.json({ error: "The private test recipient is not configured." }, { status: 503 });

  const scheduledFor = nextSevenAmEastern();
  try {
    await sendBerLabsEmail({
      to: env.SCHEDULE_TEST_EMAIL,
      subject: "BerLabs scheduler test",
      text: `This private test confirms that BerLabs can schedule a delivery for ${scheduledFor.toLocaleString("en-US", { timeZone: "America/New_York", timeZoneName: "short" })}. No subscribers received this message.`,
      html: `<main style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#102d29"><p style="color:#347c5f;font-size:12px;letter-spacing:1.5px;text-transform:uppercase">BerLabs · Private test</p><h1 style="font-size:30px">Scheduler confirmed.</h1><p>This private message verifies that your BerLabs editor can schedule delivery for tomorrow at 7:00 a.m. Eastern.</p><p style="font-size:13px;color:#5f7167">No subscribers received this test.</p></main>`,
      deliveryTime: scheduledFor,
    });
  } catch (error) {
    console.error("Could not schedule private test", error);
    return Response.json({ error: "The private scheduler test could not be queued." }, { status: 503 });
  }
  return Response.json({ scheduledFor: scheduledFor.toISOString() });
}
