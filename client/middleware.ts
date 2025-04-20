import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { decodeJWT } from "./app/utils/token";
import { JwtPayload } from "jsonwebtoken";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicPath = path === "/login" || path === "/register";

  const token = request.cookies.get("user-token")?.value || "";
  const userInfo = (await decodeJWT()) as JwtPayload & { user_id?: string };

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token && path === "/chat" && userInfo) {
    return NextResponse.redirect(
      new URL(`/chat/${userInfo?.user_id}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

