// pages/api/test.js
// app/api/test/route.js

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "API is working" }, { status: 200 });
}
