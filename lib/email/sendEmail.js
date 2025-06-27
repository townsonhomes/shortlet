import transporter from "./transporter";

export async function sendEmail({ to, subject, html }) {
  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
}
