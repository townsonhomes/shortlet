import transporter from "./transporter";

export async function sendEmail({ to, subject, html }) {
  try {
    return await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email sending failed:", err);
    throw err;
  }
}
