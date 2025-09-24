import transporter from "./transporter";

export async function sendEmail({ to, subject, html, attachments = [] }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      attachments: attachments.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content, // This should be a Buffer
        contentType: attachment.contentType || "application/pdf",
        // encoding: attachment.encoding // Only include if you're using base64 string
      })),
    };

    console.log("📧 Sending email with options:", {
      to: mailOptions.to,
      subject: mailOptions.subject,
      attachmentCount: mailOptions.attachments.length,
      attachmentInfo: mailOptions.attachments.map((a) => ({
        filename: a.filename,
        size: a.content?.length || 0,
      })),
    });

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", result.messageId);
    return result;
  } catch (err) {
    console.error("Email sending failed:", err);
    throw err;
  }
}
