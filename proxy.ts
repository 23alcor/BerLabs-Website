import { NextRequest, NextResponse } from "next/server";

const legacyHost = "berlabs.alcoberlabs.xyz";
const canonicalHost = "news.berlabs.dev";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();

  if (host === legacyHost) {
    const destination = request.nextUrl.clone();
    destination.protocol = "https:";
    destination.host = canonicalHost;
    return NextResponse.redirect(destination, 301);
  }

  return NextResponse.next();
}
