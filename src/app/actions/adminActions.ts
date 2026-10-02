'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/status';
import { Order, Product } from '@/types';
import { PRODUCTS } from '@/data/products';
import { getOrderByNumberAction } from './orderActions';
import { sendPaymentVerifiedEmail, sendOrderDispatchedEmail } from '@/lib/email/resend';

export interface AdminStats {
  totalOrders: number;
  activeSilaiCount: number;
  pendingPaymentCount: number;
  totalRevenuePKR: number;
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  city: string;
  totalAmountPKR: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'verified' | 'rejected' | 'refunded';
  silaiStatus: 'order_placed' | 'fabric_cut' | 'tailor_stitching' | 'quality_check' | 'dispatched' | 'delivered' | 'cancelled';
  itemsCount: number;
  hasCustomStitching: boolean;
  createdAt: string;
}

/**
 * Server-side guard: verify caller's active session has role === 'admin'
 */
async function verifyAdminSession(): Promise<{ authorized: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { authorized: true };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { authorized: false, error: 'Authentication required. Please log in as an administrator.' };
    }

    const adminSupabase = createAdminClient() as any;
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { authorized: false, error: 'Unauthorized: Admin privileges required.' };
    }

    return { authorized: true };
  } catch (err) {
    console.error('Admin session verification error:', err);
    return { authorized: false, error: 'Failed to verify administrative credentials.' };
  }
}

/**
 * Public helper for storefront to fetch live in_stock flags without admin auth
 */
export async function getStorefrontStockMapAction(): Promise<Record<string, boolean>> {
  if (!isSupabaseConfigured()) {
    return {};
  }
  try {
    const adminSupabase = createAdminClient() as any;
    const { data: products } = await adminSupabase
      .from('products')
      .select('id, slug, in_stock');

    if (!products) return {};
    const map: Record<string, boolean> = {};
    for (const p of products) {
      if (p.id) map[p.id] = p.in_stock;
      if (p.slug) map[p.slug] = p.in_stock;
    }
    return map;
  } catch (err) {
    console.error('Error fetching storefront stock map:', err);
    return {};
  }
}

/**
 * Get overall workshop dashboard statistics
 */
export async function getAdminStatsAction(): Promise<AdminStats> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { totalOrders: 0, activeSilaiCount: 0, pendingPaymentCount: 0, totalRevenuePKR: 0 };
  }

  if (!isSupabaseConfigured()) {
    return { totalOrders: 0, activeSilaiCount: 0, pendingPaymentCount: 0, totalRevenuePKR: 0 };
  }

  try {
    const adminSupabase = createAdminClient() as any;
    const { data: orders, error } = await adminSupabase
      .from('orders')
      .select('total_amount_pkr, payment_status, payment_method, silai_status');

    if (error || !orders) {
      return { totalOrders: 0, activeSilaiCount: 0, pendingPaymentCount: 0, totalRevenuePKR: 0 };
    }

    const totalOrders = orders.length;
    const activeSilaiCount = orders.filter((o: any) =>
      ['fabric_cut', 'tailor_stitching', 'quality_check'].includes(o.silai_status)
    ).length;
    const pendingPaymentCount = orders.filter(
      (o: any) => o.payment_status === 'pending' && ['bank_transfer', 'jazzcash_easypaisa'].includes(o.payment_method)
    ).length;
    const totalRevenuePKR = orders.reduce((acc: number, o: any) => acc + (o.total_amount_pkr || 0), 0);

    return { totalOrders, activeSilaiCount, pendingPaymentCount, totalRevenuePKR };
  } catch (err) {
    console.error('Error in getAdminStatsAction:', err);
    return { totalOrders: 0, activeSilaiCount: 0, pendingPaymentCount: 0, totalRevenuePKR: 0 };
  }
}

/**
 * Fetch all orders for admin table with optional status filter
 */
export async function getAdminOrdersAction(filterStatus?: string): Promise<AdminOrderListItem[]> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return [];
  }

  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const adminSupabase = createAdminClient() as any;
    let query = adminSupabase
      .from('orders')
      .select('id, order_number, guest_phone, shipping_address, total_amount_pkr, payment_method, payment_status, silai_status, created_at, order_items(stitching_type)')
      .order('created_at', { ascending: false });

    if (filterStatus && filterStatus !== 'all') {
      if (['pending', 'verified', 'rejected'].includes(filterStatus)) {
        query = query.eq('payment_status', filterStatus);
      } else {
        query = query.eq('silai_status', filterStatus);
      }
    }

    const { data: orders, error } = await query;

    if (error || !orders) {
      console.error('Error fetching admin orders:', error);
      return [];
    }

    return orders.map((o: any) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.shipping_address?.fullName || 'Customer',
      customerPhone: o.guest_phone || o.shipping_address?.phone || '',
      city: o.shipping_address?.city || 'Pakistan',
      totalAmountPKR: o.total_amount_pkr,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      silaiStatus: o.silai_status,
      itemsCount: o.order_items?.length || 1,
      hasCustomStitching: (o.order_items || []).some((oi: any) => oi.stitching_type === 'custom'),
      createdAt: o.created_at.split('T')[0],
    }));
  } catch (err) {
    console.error('getAdminOrdersAction error:', err);
    return [];
  }
}

/**
 * Fetch full order details including tailor measurements, payment receipt, and customer details
 */
export async function getAdminOrderDetailsAction(orderNumber: string): Promise<any | null> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const adminSupabase = createAdminClient() as any;
    const { data: order, error } = await adminSupabase
      .from('orders')
      .select('*, order_items(*, tailoring_specs(*)), payments(*)')
      .eq('order_number', orderNumber)
      .single();

    if (error || !order) return null;

    let receiptSignedUrl: string | null = null;
    const payment = order.payments?.[0];

    // If receipt was uploaded to private bucket, create a secure signed URL (valid for 1 hour)
    if (payment?.receipt_image_url) {
      if (payment.receipt_image_url.startsWith('http')) {
        receiptSignedUrl = payment.receipt_image_url;
      } else {
        const { data: signedData } = await adminSupabase.storage
          .from('receipts')
          .createSignedUrl(payment.receipt_image_url, 3600);
        if (signedData?.signedUrl) {
          receiptSignedUrl = signedData.signedUrl;
        }
      }
    }

    return {
      id: order.id,
      orderNumber: order.order_number,
      createdAt: order.created_at.split('T')[0],
      totalAmountPKR: order.total_amount_pkr,
      subtotalPKR: order.subtotal_pkr,
      shippingFeePKR: order.shipping_fee_pkr,
      discountPKR: order.discount_amount_pkr,
      couponCode: order.coupon_code,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      silaiStatus: order.silai_status,
      courierPartner: order.courier_name || 'TCS Express',
      trackingNumber: order.tracking_number || '',
      trackingUrl: order.tracking_url || '',
      customerNotes: order.customer_notes || '',
      shippingAddress: order.shipping_address,
      items: (order.order_items || []).map((oi: any) => ({
        id: oi.id,
        title: oi.product_title,
        stitchingType: oi.stitching_type,
        size: oi.size,
        quantity: oi.quantity,
        unitPrice: oi.unit_price_pkr,
        addOnsPrice: oi.add_ons_price_pkr,
        totalPrice: oi.total_price_pkr,
        customSpecs: oi.tailoring_specs?.[0]
          ? {
              kameezLength: oi.tailoring_specs[0].kameez_length,
              chest: oi.tailoring_specs[0].chest,
              waist: oi.tailoring_specs[0].waist,
              hips: oi.tailoring_specs[0].hips,
              shoulder: oi.tailoring_specs[0].shoulder,
              armhole: oi.tailoring_specs[0].armhole,
              sleeveLength: oi.tailoring_specs[0].sleeve_length,
              daman: oi.tailoring_specs[0].daman,
              necklineStyle: oi.tailoring_specs[0].neckline_style,
              sleevesStyle: oi.tailoring_specs[0].sleeves_style,
              trouserType: oi.tailoring_specs[0].trouser_type,
              trouserLength: oi.tailoring_specs[0].trouser_length,
              trouserWaist: oi.tailoring_specs[0].trouser_waist,
              trouserCuff: oi.tailoring_specs[0].trouser_cuff,
              hasShameez: oi.tailoring_specs[0].has_shameez,
              hasLatkan: oi.tailoring_specs[0].has_latkan,
              customNotes: oi.tailoring_specs[0].custom_notes,
            }
          : null,
      })),
      paymentDetails: payment
        ? {
            method: payment.method,
            transactionId: payment.transaction_id,
            senderAccountTitle: payment.sender_account_title,
            receiptUrl: receiptSignedUrl,
            verifiedAt: payment.verified_at,
            rejectionReason: payment.rejection_reason,
          }
        : null,
    };
  } catch (err) {
    console.error('getAdminOrderDetailsAction error:', err);
    return null;
  }
}

/**
 * Update the 5-step Silai status in the workshop pipeline
 */
export async function updateSilaiStatusAction(
  orderNumber: string,
  newStatus: string,
  courierPartner?: string,
  trackingNumber?: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized: Admin privileges required.' };
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const adminSupabase = createAdminClient() as any;
    const updates: any = {
      silai_status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (courierPartner) updates.courier_name = courierPartner;
    if (trackingNumber) {
      updates.tracking_number = trackingNumber;
      updates.tracking_url = `https://www.tcsexpress.com/tracking?track=${trackingNumber}`;
    }

    const { error } = await adminSupabase
      .from('orders')
      .update(updates)
      .eq('order_number', orderNumber);

    if (error) throw error;

    // Asynchronously notify customer when parcel is dispatched with tracking code
    if (newStatus === 'dispatched') {
      getOrderByNumberAction(orderNumber).then((ord) => {
        if (ord) {
          sendOrderDispatchedEmail({
            ...ord,
            courierPartner: (courierPartner as any) || ord.courierPartner,
            trackingNumber: trackingNumber || ord.trackingNumber,
          }).catch((e) => console.warn('Dispatched email notification failed:', e));
        }
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error('updateSilaiStatusAction error:', err);
    return { success: false, error: err.message || 'Failed to update silai status.' };
  }
}

/**
 * Approve or reject customer payment proof (IBFT / JazzCash / Easypaisa)
 */
export async function verifyPaymentAction(
  orderNumber: string,
  approved: boolean,
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized: Admin privileges required.' };
  }

  const newPaymentStatus = approved ? 'verified' : 'rejected';
  const newSilaiStatus = approved ? 'fabric_cut' : 'order_placed';

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const adminSupabase = createAdminClient() as any;

    // Update order
    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .update({
        payment_status: newPaymentStatus,
        silai_status: newSilaiStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('order_number', orderNumber)
      .select('id')
      .single();

    if (orderError) throw orderError;

    // Update payment record if exists
    if (order?.id) {
      await adminSupabase
        .from('payments')
        .update({
          verified_at: approved ? new Date().toISOString() : null,
          rejection_reason: rejectionReason || null,
        })
        .eq('order_id', order.id);
    }

    // Asynchronously notify customer when payment is approved
    if (approved) {
      getOrderByNumberAction(orderNumber).then((ord) => {
        if (ord) {
          sendPaymentVerifiedEmail(ord).catch((e) =>
            console.warn('Payment verified email notification failed:', e)
          );
        }
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error('verifyPaymentAction error:', err);
    return { success: false, error: err.message || 'Failed to verify payment.' };
  }
}

/**
 * Toggle catalog product in-stock availability
 */
export async function toggleProductStockAction(
  productId: string,
  inStock: boolean
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized: Admin privileges required.' };
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const adminSupabase = createAdminClient() as any;
    const { error } = await adminSupabase
      .from('products')
      .update({ in_stock: inStock })
      .eq('id', productId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all products for admin inventory manager
 */
export async function getAdminProductsAction(): Promise<Product[]> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return PRODUCTS;
  }

  if (!isSupabaseConfigured()) {
    return PRODUCTS;
  }

  try {
    const adminSupabase = createAdminClient() as any;
    const { data: products, error } = await adminSupabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !products || products.length === 0) {
      return PRODUCTS;
    }

    return products.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      collection: p.collection,
      sku: p.sku,
      category: p.category,
      pieceCount: p.piece_count,
      fabric: p.fabric,
      fabricDescription: p.fabric_description || '',
      colorName: p.color_name,
      colorHex: p.color_hex,
      basePricePKR: p.base_price_pkr,
      standardStitchingFeePKR: p.standard_stitching_fee_pkr,
      customStitchingFeePKR: p.custom_stitching_fee_pkr,
      images: p.images,
      tags: p.tags || [],
      occasion: p.occasion,
      boxContents: p.box_contents,
      rating: Number(p.rating),
      reviewCount: p.review_count,
      isNew: p.is_new,
      isBestSeller: p.is_best_seller,
      inStock: p.in_stock,
    }));
  } catch (err) {
    console.error('getAdminProductsAction error:', err);
    return PRODUCTS;
  }
}
