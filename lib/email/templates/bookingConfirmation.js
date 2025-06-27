export function generateBookingConfirmationEmail({
  name,
  shortlet,
  checkInDate,
  checkOutDate,
  totalAmount,
}) {
  const profileLink = `${process.env.NEXT_PUBLIC_BASE_URL}/profile`;

  return {
    subject: "Your Booking is Confirmed – Shortlet",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 24px; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #333333;">🎉 Booking Confirmed!</h2>
        <p style="font-size: 16px; color: #555555;">Hi <strong>${name}</strong>,</p>

        <p style="font-size: 16px; color: #555555;">
          Thank you for your booking with us. Below are your booking details:
        </p>

        <table style="width: 100%; font-size: 16px; color: #333333; margin-top: 16px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>🏠 Shortlet:</strong></td>
            <td style="padding: 8px 0;">${shortlet}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>📅 Check-in:</strong></td>
            <td style="padding: 8px 0;">${new Date(
              checkInDate
            ).toDateString()} By 1 PM</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>📅 Check-out:</strong></td>
            <td style="padding: 8px 0;">${new Date(
              checkOutDate
            ).toDateString()} By 12PM</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>💰 Total Paid:</strong></td>
            <td style="padding: 8px 0;">₦${totalAmount}</td>
          </tr>
        </table>

        <p style="margin-top: 24px; font-size: 16px; color: #555555;">
          You can view your booking and manage it anytime by clicking the button below:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${profileLink}" style="background-color: #0070f3; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View My Profile
          </a>
        </div>

        <p style="font-size: 14px; color: #888888; text-align: center;">
          If you have any questions, feel free to reply to this email.
        </p>

        <p style="font-size: 14px; color: #888888; text-align: center;">
          – The Shortlet Team
        </p>
      </div>
    `,
  };
}
