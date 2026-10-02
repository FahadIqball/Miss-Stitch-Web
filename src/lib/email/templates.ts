import { Order } from '@/types';

interface EmailTemplateOptions {
  siteUrl?: string;
  whatsappNumber?: string;
}

const BRAND_RANI = '#E61A6B';
const BRAND_GOLD = '#D4AF37';
const BRAND_GREEN = '#0A5C36';
const BRAND_DARK = '#1F1F24';
const BRAND_BG = '#FAF8F5';
const BRAND_BORDER = '#E5E2DC';

function formatCurrency(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

/**
 * 1. Order Confirmation Email Template
 */
export function renderOrderConfirmationHtml(order: Order, options?: EmailTemplateOptions): string {
  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const whatsappNumber = options?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923001234567';
  const trackUrl = `${siteUrl}/track-order?order=${order.orderNumber}`;

  const itemsHtml = order.items
    .map((item) => {
      const isCustom = item.stitchingMode === 'custom';
      return `
      <tr style="border-bottom: 1px solid ${BRAND_BORDER};">
        <td style="padding: 14px 8px; vertical-align: top;">
          <strong style="color: ${BRAND_DARK}; font-size: 14px;">${item.title}</strong>
          <div style="font-size: 12px; color: #66666E; margin-top: 4px;">
            Stitching: <span style="font-weight: bold; color: ${BRAND_RANI}; text-transform: capitalize;">${item.stitchingMode}</span>
            ${item.standardSize ? ` • Size: <strong>${item.standardSize}</strong>` : ''}
            • Qty: <strong>${item.quantity}</strong>
          </div>
          ${
            item.addons.attachedLining || item.addons.edgeFinishingTassels
              ? `<div style="font-size: 11px; color: ${BRAND_GREEN}; margin-top: 3px;">
                  Add-ons: ${[
                    item.addons.attachedLining ? 'Attached Shameez (Lining)' : '',
                    item.addons.edgeFinishingTassels ? 'Latkan & Tassels' : '',
                  ]
                    .filter(Boolean)
                    .join(' + ')}
                </div>`
              : ''
          }
          ${
            isCustom && item.customMeasurements
              ? `<div style="font-size: 11px; color: #55555C; background-color: #FAF5E6; padding: 6px 8px; border-radius: 4px; margin-top: 6px;">
                  <strong>Custom Fit Specs:</strong> Length: ${item.customMeasurements.shirtLength}" | Chest: ${item.customMeasurements.chest}" | Waist: ${item.customMeasurements.waist}" | Hips: ${item.customMeasurements.hips}" | Style: ${item.customMeasurements.trouserStyle || 'Straight Trouser'}
                </div>`
              : ''
          }
        </td>
        <td style="padding: 14px 8px; text-align: right; vertical-align: top; font-family: monospace; font-size: 13px; font-weight: bold; color: ${BRAND_DARK};">
          ${formatCurrency(item.unitTotalPKR * item.quantity)}
        </td>
      </tr>
    `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation #${order.orderNumber} — Miss Stitch</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_BG}; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: ${BRAND_DARK};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_BG}; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border: 1px solid ${BRAND_BORDER}; border-radius: 12px; overflow: hidden; max-width: 600px; width: 100%;">
          
          <!-- Header Bar -->
          <tr>
            <td style="background-color: ${BRAND_DARK}; padding: 28px 24px; text-align: center; border-bottom: 3px solid ${BRAND_GOLD};">
              <span style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #FFFFFF; letter-spacing: 2px; text-transform: uppercase;">MISS STITCH</span>
              <div style="font-size: 10px; color: ${BRAND_GOLD}; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px;">Pakistani Luxury Pret & Bespoke Digital Silai</div>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="padding: 32px 28px 16px 28px; text-align: center;">
              <div style="display: inline-block; background-color: #EBF7EE; color: ${BRAND_GREEN}; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; padding: 5px 14px; border-radius: 20px; margin-bottom: 12px;">
                ✓ Order Confirmed
              </div>
              <h1 style="font-family: Georgia, serif; font-size: 24px; color: ${BRAND_DARK}; margin: 0 0 8px 0;">Shukriya, ${order.shippingAddress.fullName}!</h1>
              <p style="font-size: 13px; color: #66666E; margin: 0; line-height: 1.5;">
                Your suit order <strong style="color: ${BRAND_RANI}; font-family: monospace;">#${order.orderNumber}</strong> has been registered. Our Master Cutters are preparing your festive fabric.
              </p>
            </td>
          </tr>

          <!-- 5-Step Status Stepper -->
          <tr>
            <td style="padding: 12px 28px;">
              <div style="background-color: ${BRAND_BG}; border: 1px solid ${BRAND_BORDER}; border-radius: 8px; padding: 14px; text-align: center;">
                <div style="font-size: 11px; font-weight: bold; color: ${BRAND_GOLD}; text-transform: uppercase; letter-spacing: 1px;">Current Atelier Status</div>
                <div style="font-size: 16px; font-family: Georgia, serif; font-weight: bold; color: ${BRAND_DARK}; margin-top: 4px;">
                  ${order.status === 'fabric_cut' ? 'Fabric Cut & Inspected' : 'Order Placed in Silai Queue'}
                </div>
                <div style="font-size: 11px; color: #8F8F99; margin-top: 4px;">Next: Master Tailor Silai & Quality Inspection</div>
              </div>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 16px 28px;">
              <h3 style="font-family: Georgia, serif; font-size: 15px; color: ${BRAND_DARK}; margin: 0 0 10px 0; border-bottom: 2px solid ${BRAND_GOLD}; padding-bottom: 6px;">
                Order Summary
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Price Breakdown -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #44444A;">
                <tr>
                  <td style="padding: 4px 0;">Subtotal</td>
                  <td style="padding: 4px 0; text-align: right; font-family: monospace;">${formatCurrency(order.subtotalPKR)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;">Nationwide Delivery (TCS Express)</td>
                  <td style="padding: 4px 0; text-align: right; font-family: monospace;">${order.shippingFeePKR === 0 ? 'FREE' : formatCurrency(order.shippingFeePKR)}</td>
                </tr>
                ${
                  order.discountPKR > 0
                    ? `<tr>
                        <td style="padding: 4px 0; color: ${BRAND_GREEN};">Promotional Discount</td>
                        <td style="padding: 4px 0; text-align: right; font-family: monospace; color: ${BRAND_GREEN};">-${formatCurrency(order.discountPKR)}</td>
                      </tr>`
                    : ''
                }
                <tr style="border-top: 2px solid ${BRAND_DARK};">
                  <td style="padding: 10px 0 0 0; font-weight: bold; font-size: 15px; color: ${BRAND_DARK};">Grand Total</td>
                  <td style="padding: 10px 0 0 0; text-align: right; font-weight: bold; font-size: 16px; font-family: monospace; color: ${BRAND_RANI};">
                    ${formatCurrency(order.totalPKR)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Address & Payment Method -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 10px;">
                    <div style="font-size: 11px; font-weight: bold; color: #8F8F99; text-transform: uppercase;">Shipping To:</div>
                    <div style="font-size: 12px; color: ${BRAND_DARK}; margin-top: 4px; line-height: 1.4;">
                      <strong>${order.shippingAddress.fullName}</strong><br>
                      ${order.shippingAddress.address}<br>
                      ${order.shippingAddress.city}, ${order.shippingAddress.province}<br>
                      📞 ${order.shippingAddress.phone}
                    </div>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 10px;">
                    <div style="font-size: 11px; font-weight: bold; color: #8F8F99; text-transform: uppercase;">Payment Method:</div>
                    <div style="font-size: 12px; color: ${BRAND_DARK}; margin-top: 4px; line-height: 1.4;">
                      <strong style="text-transform: capitalize;">${order.paymentMethod.replace('_', ' ')}</strong><br>
                      Status: <strong style="color: ${order.paymentStatus === 'verified' ? BRAND_GREEN : BRAND_GOLD};">${order.paymentStatus.toUpperCase()}</strong>
                      ${order.paymentMethod === 'cod' ? '<br>(Pay upon delivery at your doorstep)' : ''}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTAs: Live Tracking & WhatsApp -->
          <tr>
            <td style="padding: 10px 28px 30px 28px; text-align: center; border-top: 1px solid ${BRAND_BORDER};">
              <a href="${trackUrl}" style="display: inline-block; background-color: ${BRAND_RANI}; color: #FFFFFF; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 12px 26px; border-radius: 6px; text-decoration: none; margin-right: 8px; margin-bottom: 8px;">
                Track Live Silai Progress →
              </a>
              <a href="https://wa.me/${whatsappNumber}?text=Assalam-o-Alaikum%20Miss%20Stitch!%20Inquiry%20regarding%20Order%20%23${order.orderNumber}" style="display: inline-block; background-color: #FFFFFF; color: ${BRAND_GREEN}; border: 1px solid ${BRAND_GREEN}; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 11px 22px; border-radius: 6px; text-decoration: none; margin-bottom: 8px;">
                WhatsApp Concierge
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND_BG}; padding: 20px 24px; text-align: center; font-size: 11px; color: #8F8F99; border-top: 1px solid ${BRAND_BORDER}; line-height: 1.5;">
              Miss Stitch Atelier • Gulberg III, Lahore, Pakistan<br>
              Direct Helpline: +92 300 1234567 • Email: atelier@missstitch.pk<br>
              © ${new Date().getFullYear()} Miss Stitch. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 2. Payment Verified & Silai Initiated Email Template
 */
export function renderPaymentVerifiedHtml(order: Order, options?: EmailTemplateOptions): string {
  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const trackUrl = `${siteUrl}/track-order?order=${order.orderNumber}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Verified #${order.orderNumber} — Miss Stitch</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_BG}; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: ${BRAND_DARK};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_BG}; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border: 1px solid ${BRAND_BORDER}; border-radius: 12px; overflow: hidden; max-width: 600px; width: 100%;">
          
          <tr>
            <td style="background-color: ${BRAND_DARK}; padding: 24px; text-align: center; border-bottom: 3px solid ${BRAND_GOLD};">
              <span style="font-family: Georgia, serif; font-size: 24px; font-weight: bold; color: #FFFFFF; letter-spacing: 2px;">MISS STITCH</span>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 28px; text-align: center;">
              <div style="display: inline-block; background-color: #EBF7EE; color: ${BRAND_GREEN}; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; padding: 5px 14px; border-radius: 20px; margin-bottom: 12px;">
                ✓ Payment Received & Verified
              </div>
              <h1 style="font-family: Georgia, serif; font-size: 22px; color: ${BRAND_DARK}; margin: 0 0 10px 0;">
                Payment Verified for Order #${order.orderNumber}
              </h1>
              <p style="font-size: 13px; color: #66666E; margin: 0 0 20px 0; line-height: 1.5;">
                Dear ${order.shippingAddress.fullName}, your bank transfer / online payment of <strong>${formatCurrency(order.totalPKR)}</strong> has been verified by our workshop accounts team.
              </p>
              
              <div style="background-color: #FAF5E6; border: 1px solid ${BRAND_GOLD}; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: left;">
                <div style="font-size: 12px; font-weight: bold; color: ${BRAND_DARK};">✂️ Master Tailor Silai Pipeline Update:</div>
                <div style="font-size: 12px; color: #66666E; margin-top: 4px;">
                  Your festive fabric has moved to <strong>Stage 2: Fabric Cut & Tailoring Allocation</strong>. Master Cutters have generated your Job Card and stitching is officially underway.
                </div>
              </div>

              <a href="${trackUrl}" style="display: inline-block; background-color: ${BRAND_RANI}; color: #FFFFFF; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 12px 26px; border-radius: 6px; text-decoration: none;">
                View Live Silai Stepper →
              </a>
            </td>
          </tr>

          <tr>
            <td style="background-color: ${BRAND_BG}; padding: 18px 24px; text-align: center; font-size: 11px; color: #8F8F99; border-top: 1px solid ${BRAND_BORDER};">
              Miss Stitch Atelier • Gulberg III, Lahore, Pakistan • atelier@missstitch.pk
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 3. Order Dispatched Email Template with TCS Courier Tracking
 */
export function renderOrderDispatchedHtml(order: Order, options?: EmailTemplateOptions): string {
  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const courier = order.courierPartner || 'TCS Express';
  const trackingNumber = order.trackingNumber || 'Pending Dispatch';
  const trackingUrl = order.trackingNumber
    ? `https://www.tcsexpress.com/tracking?track=${order.trackingNumber}`
    : `${siteUrl}/track-order?order=${order.orderNumber}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Suit is Dispatched #${order.orderNumber} — Miss Stitch</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_BG}; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: ${BRAND_DARK};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_BG}; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border: 1px solid ${BRAND_BORDER}; border-radius: 12px; overflow: hidden; max-width: 600px; width: 100%;">
          
          <tr>
            <td style="background-color: ${BRAND_DARK}; padding: 24px; text-align: center; border-bottom: 3px solid ${BRAND_GOLD};">
              <span style="font-family: Georgia, serif; font-size: 24px; font-weight: bold; color: #FFFFFF; letter-spacing: 2px;">MISS STITCH</span>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 28px; text-align: center;">
              <div style="display: inline-block; background-color: #FDF4EB; color: #D97706; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; padding: 5px 14px; border-radius: 20px; margin-bottom: 12px;">
                🚚 Dispatched via ${courier}
              </div>
              <h1 style="font-family: Georgia, serif; font-size: 22px; color: ${BRAND_DARK}; margin: 0 0 10px 0;">
                Your Suit is on its Way!
              </h1>
              <p style="font-size: 13px; color: #66666E; margin: 0 0 20px 0; line-height: 1.5;">
                Dear ${order.shippingAddress.fullName}, your custom tailored suits have passed our rigorous 10-point fit & quality inspection and have been handed over to <strong>${courier}</strong> for delivery to ${order.shippingAddress.city}.
              </p>
              
              <!-- Tracking Box -->
              <div style="background-color: #FAF8F5; border: 2px dashed ${BRAND_GOLD}; border-radius: 8px; padding: 18px; margin-bottom: 24px; text-align: center;">
                <div style="font-size: 11px; color: #8F8F99; text-transform: uppercase; letter-spacing: 1px;">Consignment / Tracking Number</div>
                <div style="font-size: 20px; font-family: monospace; font-weight: bold; color: ${BRAND_RANI}; margin-top: 6px;">
                  ${trackingNumber}
                </div>
                <div style="font-size: 11px; color: #66666E; margin-top: 6px;">
                  Estimated Delivery: 24–48 Hours within Pakistan
                </div>
              </div>

              <a href="${trackingUrl}" style="display: inline-block; background-color: ${BRAND_DARK}; color: #FFFFFF; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 12px 26px; border-radius: 6px; text-decoration: none;">
                Track Live Courier Consignment →
              </a>
            </td>
          </tr>

          <tr>
            <td style="background-color: ${BRAND_BG}; padding: 18px 24px; text-align: center; font-size: 11px; color: #8F8F99; border-top: 1px solid ${BRAND_BORDER};">
              Miss Stitch Atelier • Gulberg III, Lahore, Pakistan • Direct Helpline: +92 300 1234567
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
