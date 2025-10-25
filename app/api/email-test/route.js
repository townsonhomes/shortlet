// app/api/send-test-email/route.js
import { sendEmail } from "@/lib/email/sendEmail";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters from URL query string
    const to = "michael303.mi@gmail.com";
    const subject = "Test Email from Next.js";
    const name = "Test User";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body>
          <h1>Hello ${name}!</h1>
          <p>This is a test email sent from your Next.js application.</p>
          <p>If you received this, your email setup is working correctly! 🎉</p>
          <hr>
          <p><small>Sent via StayInTowsonHomes.com</small></p>
        </body>
      </html>
    `;

    console.log("🔄 GET: Starting email send", { to, subject, name });

    // Send the email using your existing function
    const result = await sendEmail({
      to,
      subject,
      html,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      messageId: result.messageId,
      details: {
        to,
        subject,
        name,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ GET: Email sending failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test email",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
