import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "token";

const AUTH_PATHS = ["/login", "/register"] as const;

const DEFAULT_AUTHED_PATH = "/chat";
const DEFAULT_GUEST_PATH = "/login";

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasToken = request.cookies.has(AUTH_COOKIE_NAME);

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = hasToken ? DEFAULT_AUTHED_PATH : DEFAULT_GUEST_PATH;
    return NextResponse.redirect(url);
  }

  const onAuthPath = isAuthPath(pathname);

  if (hasToken && onAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_AUTHED_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!hasToken && !onAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = DEFAULT_GUEST_PATH;
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match semua route KECUALI:
     * - /api/*       (di-rewrite ke BE; BE handle auth-nya sendiri lewat JWT cookie)
     * - /_next/*     (build asset & image optimizer)
     * - /favicon.ico, sitemap.xml, robots.txt
     * - file static (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
