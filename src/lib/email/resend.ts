import { Resend } from 'resend';
import { Order } from '@/types';
import {
  renderOrderConfirmationHtml,
  renderPaymentVerifiedHtml,
  renderOrderDispatchedHtml,
} from './templates';

const apiKey = process.env.RESEND_API_KEY;
export const resend = apiKey ? new Resend(apiKey) : null;

// Free tier default sender or custom verified domain
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Miss Stitch <onboarding@resend.dev>';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Send branded HTML Order Confirmation email to customer
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<SendEmailResult> {
  const recipient = order.shippingAddress.email;
  if (!recipient || !recipient.includes('@')) {
    return { success: false, error: 'No valid recipient email on order.' };
  }

  const subject = `Order Confirmed #${order.orderNumber} — Miss Stitch Bespoke Silai`;
  const html = renderOrderConfirmationHtml(order);

  if (!resend) {
    console.log(
      `\n[Resend Simulated Email] To: ${recipient} | Subject: ${subject} | Order: ${order.orderNumber} | Total: PKR ${order.totalPKR}`
    );
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient,
      subject,
      html,
    });

    if (error) {
      console.warn(`Resend failed to send Order Confirmation to ${recipient}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('Unhandled Resend exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send Payment Verified & Tailoring Initiated email to customer
 */
export async function sendPaymentVerifiedEmail(order: Order): Promise<SendEmailResult> {
  const recipient = order.shippingAddress.email;
  if (!recipient || !recipient.includes('@')) {
    return { success: false, error: 'No valid recipient email on order.' };
  }

  const subject = `Payment Verified for Order #${order.orderNumber} (Fabric Cut Initiated) — Miss Stitch`;
  const html = renderPaymentVerifiedHtml(order);

  if (!resend) {
    console.log(
      `\n[Resend Simulated Email] To: ${recipient} | Subject: ${subject} | Order: ${order.orderNumber}`
    );
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient,
      subject,
      html,
    });

    if (error) {
      console.warn(`Resend failed to send Payment Verified to ${recipient}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('Unhandled Resend exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send Order Dispatched email with Courier Consignment tracking code
 */
export async function sendOrderDispatchedEmail(order: Order): Promise<SendEmailResult> {
  const recipient = order.shippingAddress.email;
  if (!recipient || !recipient.includes('@')) {
    return { success: false, error: 'No valid recipient email on order.' };
  }

  const trackingCode = order.trackingNumber || 'Consignment in Transit';
  const subject = `Your Suits are Dispatched! [${order.courierPartner || 'TCS Express'} #${trackingCode}] — Miss Stitch`;
  const html = renderOrderDispatchedHtml(order);

  if (!resend) {
    console.log(
      `\n[Resend Simulated Email] To: ${recipient} | Subject: ${subject} | Tracking: ${trackingCode}`
    );
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient,
      subject,
      html,
    });

    if (error) {
      console.warn(`Resend failed to send Order Dispatched to ${recipient}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('Unhandled Resend exception:', err);
    return { success: false, error: err.message };
  }
}
