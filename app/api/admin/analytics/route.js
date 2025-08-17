// app/api/admin/analytics/route.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { parseDateParam, computeAnalytics } from "./lib/analyticsUtils";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

function buildDefaultRange() {
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );
  const start = new Date(end);
  start.setDate(end.getDate() - 29);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export async function GET(request) {
  try {
    const token = await getToken({ req: request, secret: JWT_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const url = new URL(request.url);
    const startParam = url.searchParams.get("start");
    const endParam = url.searchParams.get("end");
    const mockParam = url.searchParams.get("mock");

    const startParsed = parseDateParam(startParam);
    const endParsed = parseDateParam(endParam, true);

    if ((startParam && !startParsed) || (endParam && !endParsed)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    let rangeStart, rangeEnd;
    if (startParsed && endParsed) {
      rangeStart = startParsed;
      rangeEnd = endParsed;
    } else if (startParsed && !endParsed) {
      const now = new Date();
      rangeStart = startParsed;
      rangeEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );
    } else if (!startParsed && endParsed) {
      rangeStart = parseDateParam(endParam);
      rangeEnd = endParsed;
    } else {
      const def = buildDefaultRange();
      rangeStart = def.start;
      rangeEnd = def.end;
    }

    const useMock = mockParam === "true";
    const data = await computeAnalytics({ rangeStart, rangeEnd, useMock });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Analytics GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: JWT_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const startParam = body.start;
    const endParam = body.end;
    const mockFlag = body.mock === true || body.mock === "true";

    const startParsed = parseDateParam(startParam);
    const endParsed = parseDateParam(endParam, true);

    if ((startParam && !startParsed) || (endParam && !endParsed)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    let rangeStart, rangeEnd;
    if (startParsed && endParsed) {
      rangeStart = startParsed;
      rangeEnd = endParsed;
    } else if (startParsed && !endParsed) {
      const now = new Date();
      rangeStart = startParsed;
      rangeEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );
    } else if (!startParsed && endParsed) {
      rangeStart = parseDateParam(endParam);
      rangeEnd = endParsed;
    } else {
      const def = buildDefaultRange();
      rangeStart = def.start;
      rangeEnd = def.end;
    }

    const data = await computeAnalytics({
      rangeStart,
      rangeEnd,
      useMock: mockFlag,
    });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Analytics POST error:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
