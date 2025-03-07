import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
 
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const publicPaths = ["/login", "/signup", "/register", "/api/auth", "/globe.svg"];
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(publicPath + "/")
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|public|favicon.ico|api/auth).*)",
  ],
};