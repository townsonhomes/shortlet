export const generatePasswordChangeEmail = (name) => ({
  subject: "Your Password Has Been Changed",
  html: `
    <div style="font-family: sans-serif; color: #333; padding: 20px;">
      <h2>Hello ${name},</h2>
      <p>This is a confirmation that your account password was recently changed.</p>
      <p>If you did not make this change, please contact support immediately.</p>
      <br/>
      <p>Thank you,<br/>Shortlet Team</p>
    </div>
  `,
});
