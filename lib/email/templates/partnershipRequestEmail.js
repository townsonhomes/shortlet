export default function generateApartmentRequestEmail({
  firstName,
  lastName,
  email,
  phone,
  state,
  location,
  description,
}) {
  const subject = `New Apartment Listing Request from ${firstName} ${lastName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; background-color: #f9f9f9; padding: 30px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
        <h2 style="color: #1e1e1e;">🏡 New Apartment Listing Request</h2>
        <p style="font-size: 16px; color: #333;">
          A new potential partner is interested in listing their shortlet apartment on your platform. Here's the submission:
        </p>

        <hr style="margin: 20px 0;" />

        <table style="width: 100%; font-size: 15px; line-height: 1.6;">
          <tr>
            <td style="font-weight: bold;">Name:</td>
            <td>${firstName} ${lastName}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Email:</td>
            <td><a href="mailto:${email}" style="color: #007bff;">${email}</a></td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Phone:</td>
            <td>${phone}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">State:</td>
            <td>${state}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Property Location:</td>
            <td>${location}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; vertical-align: top;">Apartment Description:</td>
            <td style="white-space: pre-wrap;">${description}</td>
          </tr>
        </table>

        <hr style="margin: 20px 0;" />

        <p style="font-size: 14px; color: #888;">
          Please review and reach out to the partner if you're interested in onboarding their listing.
        </p>
      </div>
    </div>
  `;

  return { subject, html };
}
