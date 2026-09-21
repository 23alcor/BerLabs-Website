import { env } from "cloudflare:workers";
import { sendBerLabsEmail } from "@/lib/mailgun";

export async function POST(request: Request) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  if (host !== "editor.berlabs.dev") return Response.json({ error: "This action is only available in the private editor." }, { status: 403 });
  if (!env.SCHEDULE_TEST_EMAIL) return Response.json({ error: "The private test recipient is not configured." }, { status: 503 });

  const scheduledFor = new Date(Date.now() + 60_000);
  try {
    await sendBerLabsEmail({
      to: env.SCHEDULE_TEST_EMAIL,
      subject: "BerLabs scheduler test",
      text: `This private test confirms that BerLabs can schedule a delivery one minute in advance. It was scheduled for ${scheduledFor.toLocaleString("en-US", { timeZone: "America/New_York", timeZoneName: "short" })}. No subscribers received this message.`,
      html: `<main style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#102d29"><p style="color:#347c5f;font-size:12px;letter-spacing:1.5px;text-transform:uppercase">BerLabs · Private test</p><h1 style="font-size:30px">One-minute scheduler test.</h1><p>This private message verifies that your BerLabs editor can schedule delivery one minute in advance.</p><p style="font-size:13px;color:#5f7167">No subscribers received this test.</p></main>`,
      deliveryTime: scheduledFor,
    });
  } catch (error) {
    console.error("Could not schedule private test", error);
    return Response.json({ error: "The private scheduler test could not be queued." }, { status: 503 });
  }
  return Response.json({ scheduledFor: scheduledFor.toISOString() });
}
