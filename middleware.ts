import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "edutrack-secret-key");

const PUBLIC_PATHS = ["/", "/signup", "/api/auth/login", "/api/auth/signup", "/api/auth/approve"];

// Paths that require super_admin role specifically
const SUPER_ADMIN_PATHS = ["/users", "/audit-logs", "/api/users"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("edutrack_session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as string;

    // Role-gate super admin-only routes
    if (SUPER_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
      if (role !== "super_admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|images|uploads).*)"],
};
