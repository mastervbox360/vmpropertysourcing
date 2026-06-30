// netlify/functions/send-confirmation.js
//
// Triggered by Netlify Forms submission webhook.
// Sends a branded confirmation email to the person who submitted the form,
// from videet@send.vmpropertysourcing.co.uk via Resend.

exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body);
    const data = payload.payload?.data || payload.data || {};

    const formName = payload.payload?.form_name || payload.form_name || '';
    const email = data.email;
    const firstName = data.first_name || 'there';

    if (!email) {
      return { statusCode: 200, body: 'No email field, skipping confirmation.' };
    }

    // Pick subject + body based on which form was submitted
    let subject = 'Thank you for contacting VM Property Sourcing';
    let intro = `Thanks for getting in touch with VM Property Sourcing.`;

    if (formName === 'investor-registration') {
      subject = 'Welcome — VM Property Sourcing Investor Registration';
      intro = `Thank you for registering as an investor with VM Property Sourcing. We have added your details and criteria to our system.`;
    } else if (formName === 'vendor-enquiry') {
      subject = 'Thank you for your enquiry — VM Property Sourcing';
      intro = `Thank you for reaching out about your property. We have received your enquiry and it is being treated in strict confidence.`;
    } else if (formName === 'co-source-enquiry') {
      subject = 'Thank you for your interest in co-sourcing — VM Property Sourcing';
      intro = `Thank you for your interest in working with VM Property Sourcing on a co-sourcing basis. We have received your details.`;
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background:#F8F8F5; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F8F5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius: 4px; overflow: hidden;">
              <tr>
                <td style="background:#1B3A6B; padding: 32px 40px;">
                  <span style="color:#ffffff; font-size: 20px; font-weight: 700; letter-spacing: 1px;">VM</span>
                  <span style="color:#C9A84C; font-size: 12px; letter-spacing: 2px; margin-left: 10px; text-transform: uppercase;">Property Sourcing</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 40px 20px;">
                  <h1 style="font-family: Georgia, serif; font-size: 24px; color: #1B3A6B; margin: 0 0 20px; font-weight: 500;">Hi ${firstName},</h1>
                  <p style="font-size: 15px; line-height: 1.7; color: #2C2C2C; margin: 0 0 20px;">${intro}</p>
                  <p style="font-size: 15px; line-height: 1.7; color: #2C2C2C; margin: 0 0 20px;">We review every enquiry personally and will be back in touch shortly. If anything is urgent, you can reach us directly by replying to this email.</p>
                  <div style="border-top: 1px solid #E8E8E4; margin: 28px 0;"></div>
                  <p style="font-size: 13px; line-height: 1.7; color: #6B6B6B; margin: 0;">VM Property Sourcing Ltd<br>Cardiff, United Kingdom<br><a href="https://vmpropertysourcing.co.uk" style="color:#1B3A6B; text-decoration:none;">vmpropertysourcing.co.uk</a></p>
                </td>
              </tr>
              <tr>
                <td style="background:#F8F8F5; padding: 20px 40px; text-align:center;">
                  <p style="font-size: 11px; color: #6B6B6B; margin: 0;">VM Property Sourcing Ltd is registered with Companies House (No. 17304521) and the ICO (Ref: ZC183357).</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Videet Mardania <videet@send.vmpropertysourcing.co.uk>',
        to: [email],
        subject: subject,
        html: html
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend error:', errText);
      return { statusCode: 500, body: 'Failed to send email' };
    }

    return { statusCode: 200, body: 'Confirmation email sent' };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: 'Error processing submission' };
  }
};
