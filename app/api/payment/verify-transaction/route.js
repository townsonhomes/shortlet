import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { reference } = await req.json();

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (verifyData.data.status === "success") {
      return NextResponse.json({ status: "success", data: verifyData.data });
    } else {
      return NextResponse.json({
        status: "failed",
        error: verifyData.data.gateway_response,
      });
    }
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}
