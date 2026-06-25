import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "edutrack-secret-key");

const PUBLIC_PATHS = ["/", "/signup", "/api/auth/login", "/api/auth/signup", "/api/auth/approve"];

const SUPER_ADMIN_PATHS = ["/users", "/audit-logs", "/api/users"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("edutrack_session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as string;
    const status = payload.status as string | undefined;

    // Block inactive/pending users even if they have a valid token
    if (status && status !== "active") {
      const res = NextResponse.redirect(new URL("/", req.url));
      res.cookies.set("edutrack_session", "", { maxAge: 0, path: "/" });
      return res;
    }

    // Role-gate super admin-only routes
    if (SUPER_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
      if (role !== "super_admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Token is invalid or expired — clear it and redirect to login
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set("edutrack_session", "", { maxAge: 0, path: "/" });
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|images|uploads).*)"],
};