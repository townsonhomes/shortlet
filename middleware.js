import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/* ========= ROUTE ACCESS DEFINITIONS ========= */

// Public: no authentication required
const PUBLIC_PATHS = [
  "/api/auth",
  "/_next",
  "/search",
  "/", // homepage
  "/api/payment/webhook", // ✅ Allow Paystack webhook
];

// User-only routes
const USER_PATHS = [
  "/profile",
  "/api/profile",
  "/api/payment",
  "/api/emails",
  "/api/verify",
  "/api/verify-request",
];

// Admin-level routes (both admin + sub-admin can access)
const ADMIN_PATHS = [
  "/admin",
  "/api/admin",
  "/api/shortlets/test",
  "/api/upload",
];

// Full-admin-only routes
const FULL_ADMIN_ONLY_PATHS = [
  "/api/admin/shortlets/create",
  "/api/admin/shortlets/delete",
  "/api/admin/shortlets/owners",
  "/api/admin/shortlets/update",
  "/api/admin/analytics",
];

// Routes that allow internal secret (webhooks, services, etc.)
const INTERNAL_SECRET_PATHS = [
  "/api/bookings/addBooking",
  "/api/admin/service/mark-paid",
];

/* ========= MIDDLEWARE FUNCTION ========= */
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1️⃣ Public routes → always allow
  if (matches(pathname, PUBLIC_PATHS)) {
    return NextResponse.next();
  }

  // 2️⃣ Internal secret routes
  if (matchesExact(pathname, INTERNAL_SECRET_PATHS)) {
    const internalSecret = req.headers.get("x-internal-secret");
    if (internalSecret === process.env.INTERNAL_WEBHOOK_SECRET) {
      return NextResponse.next();
    }
    return unauthorized("Unauthorized (internal)");
  }

  // 3️⃣ Get JWT token
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  // 4️⃣ Change-password route → allow if logged in
  if (pathname.startsWith("/api/change-password")) {
    return token ? NextResponse.next() : unauthorized();
  }

  // 5️⃣ Full-admin-only routes
  if (matches(pathname, FULL_ADMIN_ONLY_PATHS)) {
    if (!token) return redirectOr401(req, pathname);
    if (token.role !== "admin") return forbidden("Admins only");
    return NextResponse.next();
  }

  // 6️⃣ Admin-level routes (admin + sub-admin)
  if (matches(pathname, ADMIN_PATHS)) {
    if (!token) return redirectOr401(req, pathname);
    if (!["admin", "sub-admin"].includes(token.role))
      return forbidden("Admin access required");
    return NextResponse.next();
  }

  // 7️⃣ User-only routes
  if (matches(pathname, USER_PATHS)) {
    if (!token) return redirectOr401(req, pathname);
    if (token.role !== "user") return forbidden("Users only");
    return NextResponse.next();
  }

  // 8️⃣ If route not matched above → allow
  return NextResponse.next();
}

/* ========= HELPERS ========= */
function matches(pathname, paths) {
  return paths.some((p) => pathname.startsWith(p));
}

function matchesExact(pathname, paths) {
  return paths.some((p) => pathname === p);
}

function isApiRoute(pathname) {
  return pathname.startsWith("/api");
}

function redirectOr401(req, pathname) {
  return isApiRoute(pathname) ? unauthorized() : redirectToLogin(req);
}

function unauthorized(msg = "Unauthorized") {
  return NextResponse.json({ error: msg }, { status: 401 });
}

function forbidden(msg = "Forbidden") {
  return NextResponse.json({ error: msg }, { status: 403 });
}

function redirectToLogin(req) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("callbackUrl", req.url);
  return NextResponse.redirect(loginUrl);
}

/* ========= CONFIG ========= */
export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/api/:path*"],
};
