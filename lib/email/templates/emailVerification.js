export const generateVerificationEmail = (token) => {
  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`;
  const subject = "Verify Your Account - Action Required";

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #2c3e50;">Email Verification</h2>
      <p style="font-size: 16px;">Thank you for signing up. Please click the button below to verify your email address and complete your registration.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify My Account</a>
      </div>
      <p style="font-size: 14px; color: #666;">This link will expire in 15 minutes. If you did not request this, you can safely ignore this email.</p>
      <p style="font-size: 14px; color: #999; margin-top: 40px;">— Shortlet Booking Team</p>
    </div>
  `;

  return { subject, html };
};
