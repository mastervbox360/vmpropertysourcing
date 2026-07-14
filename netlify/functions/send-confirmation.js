// netlify/functions/send-confirmation.js
//
// Triggered by Netlify Forms submission webhook.
// Sends a branded confirmation email to the person who submitted the form,
// from enquiries@vmpropertysourcing.co.uk via Resend.

exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body);
    const data = payload.payload?.data || payload.data || {};

    const formName = payload.payload?.form_name || payload.form_name || '';
    const email = data.email;
    const firstName = data.first_name || data['first-name'] || 'there';

    if (!email) {
      return { statusCode: 200, body: 'No email field, skipping confirmation.' };
    }

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
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>
    :root { color-scheme: light; supported-color-schemes: light; }
    body { margin: 0 !important; padding: 0 !important; background-color: #F8F8F5 !important; }
    * { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    @media (prefers-color-scheme: dark) {
      body { background-color: #F8F8F5 !important; }
      .email-wrapper { background-color: #F8F8F5 !important; }
      .header-cell { background-color: #1B3A6B !important; }
      .gold-bar { background-color: #C9A84C !important; }
      .body-cell { background-color: #ffffff !important; }
      .footer-cell { background-color: #F0F0EC !important; }
      .heading { color: #1B3A6B !important; }
      .body-text { color: #2C2C2C !important; }
      .footer-text { color: #8B8B8B !important; }
      .link { color: #1B3A6B !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#F8F8F5; font-family: Arial, Helvetica, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden;">${subject} — VM Property Sourcing Ltd</div>
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8F8F5; padding:0 0 40px 0; margin:0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px; width:100%;">

          <!-- HEADER -->
          <tr>
            <td class="header-cell" style="background-color:#1B3A6B !important; padding:18px 40px;">
              <img src="https://vmpropertysourcing.co.uk/images/email-logo.png" width="170" height="48" alt="VM Property Sourcing" style="display:block; border:0; outline:none; text-decoration:none; width:170px; height:48px;">
            </td>
          </tr>

          <!-- GOLD ACCENT BAR -->
          <tr>
            <td class="gold-bar" style="background-color:#C9A84C !important; height:3px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- BODY -->
          <tr>
            <td class="body-cell" style="background-color:#ffffff !important; padding:40px 40px 32px;">
              <h1 class="heading" style="font-family: Georgia, 'Times New Roman', serif; font-size:15px; color:#1B3A6B !important; margin:0 0 20px; font-weight:500; line-height:1.8;">Hi ${firstName},</h1>
              <p class="body-text" style="font-size:13px; line-height:1.8; color:#2C2C2C !important; margin:0 0 18px;">${intro}</p>
              <p class="body-text" style="font-size:13px; line-height:1.8; color:#2C2C2C !important; margin:0 0 32px;">We review every enquiry personally and will be back in touch shortly. If anything is urgent, you can reach us directly by replying to this email.</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #E8E8E4; padding-bottom:24px; font-size:0;">&nbsp;</td></tr>
              </table>
              <p class="footer-text" style="font-size:13px; line-height:1.8; color:#6B6B6B !important; margin:0;">
                VM Property Sourcing Ltd<br>
                Cardiff, United Kingdom<br>
                <a class="link" href="https://vmpropertysourcing.co.uk" style="color:#1B3A6B !important; text-decoration:none;">vmpropertysourcing.co.uk</a>
              </p>
            </td>
          </tr>

          <!-- BOTTOM BAR -->
          <tr>
            <td class="footer-cell" style="background-color:#F0F0EC !important; padding:18px 40px; border-top:1px solid #E8E8E4;">
              <p class="footer-text" style="font-size:11px; color:#8B8B8B !important; margin:0; text-align:center; line-height:1.6;">
                VM Property Sourcing Ltd is registered with Companies House (No. 17304521) and the ICO (Ref: C1968586), and is a member of the Property Redress Scheme (PRS059603).
              </p>
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
        from: 'VM Property Sourcing Enquiries <enquiries@vmpropertysourcing.co.uk>',
        to: [email],
        reply_to: 'videet@vmpropertysourcing.co.uk',
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
