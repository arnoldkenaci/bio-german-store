import { NextResponse, type NextRequest } from "next/server";

/** HTTP Basic Auth for the admin area. Set ADMIN_USER and ADMIN_PASSWORD. */
export function proxy(request: NextRequest) {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;

  if (!user || !password) {
    return new NextResponse("Admin ist deaktiviert: ADMIN_USER/ADMIN_PASSWORD fehlen.", { status: 503 });
  }

  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const decoded = atob(encoded);
    const sep = decoded.indexOf(":");
    if (sep > -1 && safeEqual(decoded.slice(0, sep), user) && safeEqual(decoded.slice(sep + 1), password)) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Anmeldung erforderlich", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="India House Admin", charset="UTF-8"' },
  });
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
