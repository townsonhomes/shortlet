// lib/email/templates/bookingCancellationEmail.js

export function bookingCancellationEmail({
  name,
  shortletTitle,
  checkInDate,
  checkOutDate,
}) {
  const link = `${process.env.NEXT_PUBLIC_BASE_URL}`;
  return {
    subject: "Your Booking Has Been Checkedout - shortlet",
    html: `
    <div style="font-family: 'Segoe UI', sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); overflow: hidden;">
        <div style="background-color: #dc2626; padding: 20px; color: white; text-align: center;">
          <h2 style="margin: 0;">Booking Checkout</h2>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
          <p style="font-size: 15px; line-height: 1.6;">
            We’re writing to inform you that your reservation for 
            <strong style="color: #000">${shortletTitle}</strong> from 
            <strong>${checkInDate}</strong> to 
            <strong>${checkOutDate}</strong> has been <span style="color: #dc2626;"><strong>Checkedout</strong></span>.
          </p>
          <p style="font-size: 15px; margin-top: 20px;">If you have any questions or believe this was a mistake, please reach out to us.</p>
          <div style="margin-top: 30px;">
            <a href="${link}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: 500;">Contact Support</a>
          </div>
          <hr style="margin: 30px 0;" />
          <p style="font-size: 13px; color: #777;">Thank you for using our service.</p>
        </div>
      </div>
    </div>
  `,
  };
}
