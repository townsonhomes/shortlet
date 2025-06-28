import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_PATHS = [
  "/admin",
  "/api/admin",
  "/api/shortlets/create",
  "/api/shortlets/test",
  "/api/upload",
];

const USER_PATHS = [
  "/profile",
  "/api/profile",
  "/api/payment",
  "/api/emails",
  "/api/verify",
  "/api/verify-request",
];

// 👇 Publicly accessible (no token or secret needed)
const PUBLIC_PATHS = [
  "/api/auth",
  "/_next",
  "/search",
  "/", // homepage
  "/api/payment/webhook", // ✅ Allow Paystack webhook access
];

// 👇 Routes that support internal secret (e.g. webhook → /api/bookings/addBooking)
const INTERNAL_SECRET_PATHS = [
  "/api/bookings/addBooking",
  "/api/admin/service/mark-paid",
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // ✅ Allow public routes
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ✅ Allow routes using x-internal-secret
  if (INTERNAL_SECRET_PATHS.some((path) => pathname === path)) {
    const internalSecret = req.headers.get("x-internal-secret");
    if (
      internalSecret &&
      internalSecret === process.env.INTERNAL_WEBHOOK_SECRET
    ) {
      return NextResponse.next();
    } else {
      return NextResponse.json(
        { error: "Unauthorized (internal)" },
        { status: 401 }
      );
    }
  }

  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  // ✅ Allow change-password for all authenticated users
  if (pathname.startsWith("/api/change-password")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 🔐 Admin-only protection
  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    if (!token) {
      return isApiRoute(pathname)
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        : redirectToLogin(req);
    }
    if (token.role !== "admin") {
      return isApiRoute(pathname)
        ? NextResponse.json({ error: "Admins only" }, { status: 403 })
        : redirectToLogin(req);
    }
    return NextResponse.next();
  }

  // 👤 User-only protection
  if (USER_PATHS.some((path) => pathname.startsWith(path))) {
    if (!token) {
      return isApiRoute(pathname)
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        : redirectToLogin(req);
    }
    if (token.role !== "user") {
      return isApiRoute(pathname)
        ? NextResponse.json({ error: "Users only" }, { status: 403 })
        : redirectToLogin(req);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Helper: Detect API route
function isApiRoute(pathname) {
  return pathname.startsWith("/api");
}

// Helper: Redirect UI users to login
function redirectToLogin(req) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("callbackUrl", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/api/:path*"],
};
