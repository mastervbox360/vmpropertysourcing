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
    const firstName = data.first_name || 'there';
 
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
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background-color:#F8F8F5; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8F8F5; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px; width:100%;">
 
          <!-- HEADER -->
          <tr>
            <td style="background-color:#1B3A6B; padding:28px 40px; border-radius:4px 4px 0 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- SVG Logo -->
                    <svg width="170" height="48" viewBox="0 0 170 48" xmlns="http://www.w3.org/2000/svg" aria-label="VM Property Sourcing">
                      <!-- Chevron -->
                      <polyline points="22,20 38,8 54,20" fill="none" stroke="#C9A84C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                      <!-- VM text -->
                      <text x="38" y="40" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" font-weight="300" fill="#FFFFFF" letter-spacing="1">VM</text>
                      <!-- Divider -->
                      <line x1="70" y1="10" x2="70" y2="44" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
                      <!-- PROPERTY SOURCING -->
                      <text x="78" y="27" text-anchor="start" font-family="Arial,sans-serif" font-size="7.5" font-weight="600" fill="#C9A84C" letter-spacing="2.5">PROPERTY</text>
                      <text x="78" y="39" text-anchor="start" font-family="Arial,sans-serif" font-size="7.5" font-weight="400" fill="rgba(255,255,255,0.65)" letter-spacing="2.5">SOURCING</text>
                    </svg>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
 
          <!-- GOLD ACCENT BAR -->
          <tr>
            <td style="background-color:#C9A84C; height:3px; font-size:0; line-height:0;">&nbsp;</td>
          </tr>
 
          <!-- BODY -->
          <tr>
            <td style="background-color:#ffffff; padding:40px 40px 32px;">
              <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size:24px; color:#1B3A6B; margin:0 0 20px; font-weight:500; line-height:1.3;">Hi ${firstName},</h1>
              <p style="font-size:15px; line-height:1.8; color:#2C2C2C; margin:0 0 18px;">${intro}</p>
              <p style="font-size:15px; line-height:1.8; color:#2C2C2C; margin:0 0 32px;">We review every enquiry personally and will be back in touch shortly. If anything is urgent, you can reach us directly by replying to this email.</p>
 
              <!-- DIVIDER -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #E8E8E4; padding-bottom:24px; font-size:0;">&nbsp;</td></tr>
              </table>
 
              <!-- FOOTER INFO -->
              <p style="font-size:13px; line-height:1.8; color:#6B6B6B; margin:0;">
                VM Property Sourcing Ltd<br>
                Cardiff, United Kingdom<br>
                <a href="https://vmpropertysourcing.co.uk" style="color:#1B3A6B; text-decoration:none;">vmpropertysourcing.co.uk</a>
              </p>
            </td>
          </tr>
 
          <!-- BOTTOM BAR -->
          <tr>
            <td style="background-color:#F0F0EC; padding:18px 40px; border-radius:0 0 4px 4px; border-top:1px solid #E8E8E4;">
              <p style="font-size:11px; color:#8B8B8B; margin:0; text-align:center; line-height:1.6;">
                VM Property Sourcing Ltd is registered with Companies House (No. 17304521) and the ICO (Ref: ZC183357).
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
 
